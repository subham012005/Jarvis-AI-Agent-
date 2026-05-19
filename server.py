import os
import sys
import json
import asyncio
import time
import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

# Add parent dir to path to import jarvis modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from main_and_prompt.jarviss import agent, run_jarvis
from jarvis_tool.tool import tool

# Enable Langchain Debugging to show the AI thought process in the terminal
import langchain
langchain.debug = True

import threading
import queue
from contextlib import asynccontextmanager
import main_and_prompt.jarviss as jarviss
import subprocess

whatsapp_bridge_process = None

# Hotword Detection Setup
try:
    import openwakeword
    from openwakeword.model import Model
    import sounddevice as sd
    import numpy as np
    import struct
    import speech_recognition as sr
    import io
    HOTWORD_AVAILABLE = True
except ImportError:
    HOTWORD_AVAILABLE = False

# Thread-safe queue: background thread puts events here, async task drains it
_telegram_queue: queue.Queue = queue.Queue()

def on_telegram_message(user_input, response_text):
    print(f"[TELEGRAM] Received: {user_input[:50]}")
    ts = time.strftime("%H:%M:%S")
    
    # Clean markdown from response
    cleaned = response_text.strip()
    for prefix in ["```json", "```"]:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    display_text = cleaned
    try:
        parsed = json.loads(cleaned)
        if "display_text" in parsed:
            display_text = parsed["display_text"]
    except Exception:
        pass

    _telegram_queue.put({
        "type": "telegram_update",
        "data": {"user_text": user_input, "text": display_text, "ts": ts}
    })
    # Also persist to state so new connections receive history
    state["telegram_history"].append({"user_text": user_input, "text": display_text, "ts": ts})
    print(f"[TELEGRAM] Queued message for broadcast: {display_text[:60]}")

jarviss.telegram_callback = on_telegram_message

# Shared voice state
current_language = "en"
is_listening_to_command = False
is_speaking_response = False
last_command_finished_time = 0.0
recognizer = sr.Recognizer()

def process_voice_command():
    global is_listening_to_command, last_command_finished_time
    # Flag is already set to True by the caller to prevent race conditions
    
    ts = time.strftime("%H:%M:%S")
    print("[VOICE] Activating command listener...")
    _telegram_queue.put({"type": "log", "data": {"ts": ts, "severity": "info", "source": "Jarvis", "message": "Listening for your command, sir."}})
    
    duration = 5  # seconds
    fs = 16000     # 16kHz
    
    try:
        # 1. Instantly signal frontend that hotword is detected and mic should glow/listen
        _telegram_queue.put({"type": "hotword_detected", "data": {}})
        
        # 2. Play the premium sci-fi initialization chime
        try:
            import winsound
            winsound.Beep(2000, 80)
            winsound.Beep(2600, 120)
        except Exception:
            pass
        
        # 3. Start recording voice
        recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
        sd.wait()
        
        # 4. Instantly notify frontend that voice recording has finished
        _telegram_queue.put({"type": "voice_stop", "data": {}})
        
        # 5. Play acknowledgment chime to show command has been successfully captured
        try:
            import winsound
            winsound.Beep(2400, 100)
        except Exception:
            pass
        
        audio_data = sr.AudioData(recording.tobytes(), fs, 2)
        
        print("[VOICE] Recognizing...")
        user_input = recognizer.recognize_google(audio_data)
        print(f"[VOICE] Command: {user_input}")
        
        # Play success chime
        try:
            import winsound
            winsound.Beep(2600, 100)
        except Exception:
            pass

        _telegram_queue.put({
            "type": "command_voice", 
            "data": user_input
        })
        
    except sr.UnknownValueError:
        print("[VOICE] Could not understand audio")
        # Play a failure chime
        try:
            import winsound
            winsound.Beep(1200, 100)
            winsound.Beep(800, 150)
        except Exception:
            pass
        _telegram_queue.put({"type": "voice_stop", "data": {}})
        _telegram_queue.put({"type": "log", "data": {"ts": time.strftime("%H:%M:%S"), "severity": "warning", "source": "Jarvis", "message": "I didn't catch that."}})
        is_listening_to_command = False
        last_command_finished_time = time.time()
    except Exception as e:
        print(f"[VOICE] Error: {e}")
        _telegram_queue.put({"type": "voice_stop", "data": {}})
        is_listening_to_command = False
        last_command_finished_time = time.time()

def hotword_detection_loop():
    if not HOTWORD_AVAILABLE:
        print("[HOTWORD] Missing dependencies. Hotword detection disabled.")
        return

    print("[HOTWORD] Initializing J.A.R.V.I.S. Hotword Detection (openWakeWord)...")
    
    while True: # Outer loop for automatic recovery
        try:
            # Load openWakeWord model
            print("[HOTWORD] Loading openWakeWord models...")
            base_dir = os.path.abspath(os.path.dirname(__file__))
            model_path = os.path.join(base_dir, "hey_jarvis.onnx")
            mel_path = os.path.join(base_dir, "melspectrogram.onnx")
            emb_path = os.path.join(base_dir, "embedding.onnx")

            if not os.path.exists(model_path):
                print(f"[HOTWORD] Warning: Local model not found at {model_path}. Trying default.")
                oww_model = Model(wakeword_models=["jarvis"], inference_framework="onnx")
            else:
                oww_model = Model(
                    wakeword_models=[model_path], 
                    inference_framework="onnx",
                    melspec_model_path=mel_path if os.path.exists(mel_path) else None,
                    embedding_model_path=emb_path if os.path.exists(emb_path) else None
                )
            
            print(f"[HOTWORD] Listening for 'Jarvis' via openWakeWord...")
            
            def audio_callback(indata, frames, time_info, status):
                global is_listening_to_command, is_speaking_response, last_command_finished_time
                
                # Convert raw buffer to numpy array
                audio_data = np.frombuffer(indata, dtype=np.int16)
                
                # ALWAYS feed frames to predict so the openWakeWord internal neural memory updates continuously
                prediction = oww_model.predict(audio_data)
                
                # CRITICAL: Strictly skip triggering a new command if:
                # 1. A command is currently being captured/executed (is_listening_to_command)
                # 2. Jarvis is currently speaking a response (is_speaking_response)
                # 3. We are within the 3.0 second cooldown window to prevent echo/double triggers
                if is_listening_to_command or is_speaking_response:
                    return
                if time.time() - last_command_finished_time < 3.0:
                    return
                
                if any(v > 0.5 for v in prediction.values()):
                    print(f"[HOTWORD] Detected 'Jarvis'! {prediction}")
                    if not is_listening_to_command:
                        is_listening_to_command = True
                        threading.Thread(target=process_voice_command, daemon=True).start()

            # openWakeWord works best with chunks of 1280 samples (80ms at 16kHz)
            with sd.RawInputStream(
                samplerate=16000,
                blocksize=1280,
                dtype='int16',
                channels=1,
                callback=audio_callback
            ) as stream:
                print("[HOTWORD] Audio stream active. Ready for hotword.")
                while True:
                    if not stream.active:
                        print("[HOTWORD] Stream inactive. Restarting...")
                        break
                    time.sleep(1)
                    
        except Exception as e:
            print(f"[HOTWORD] Error: {e}")
            ts = time.strftime("%H:%M:%S")
            _telegram_queue.put({"type": "log", "data": {"ts": ts, "severity": "error", "source": "System", "message": f"Hotword Error: {str(e)[:50]}"}})
            print("[HOTWORD] Restarting detection in 5 seconds...")
            time.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Async task that drains the thread-safe queue and broadcasts to WebSocket clients
    async def telegram_queue_drain():
        while True:
            try:
                msg = _telegram_queue.get_nowait()
                
                # If it's a voice command from the local server mic, process it!
                if isinstance(msg, dict) and msg.get("type") == "command_voice":
                    # Start command processing as a background task
                    asyncio.create_task(handle_command(msg.get("data"), lang=current_language))
                else:
                    await manager.broadcast(json.dumps(msg))
            except queue.Empty:
                pass
            await asyncio.sleep(0.3)

    # Startup: Start system monitor + queue drainer
    monitor_task = asyncio.create_task(system_monitor())
    drain_task = asyncio.create_task(telegram_queue_drain())
    
    # Startup: Start Telegram bot in a background thread
    telegram_thread = threading.Thread(target=run_jarvis, daemon=True)
    telegram_thread.start()

    # Startup: Start WhatsApp bridge in a background thread
    def run_whatsapp_bridge():
        print("[WHATSAPP] Starting bridge...")
        bridge_dir = os.path.join(os.path.dirname(__file__), "whatsapp-bridge")
        bridge_script = os.path.join(bridge_dir, "whatsapp_bridge.py")
        
        # Determine the python executable to use
        python_exe = sys.executable
        venv_python = os.path.join(bridge_dir, ".venv", "Scripts", "python.exe")
        if os.path.exists(venv_python):
            python_exe = venv_python
            print(f"[WHATSAPP] Using bridge venv: {python_exe}")
        
        # Use subprocess to run the bridge script
        global whatsapp_bridge_process
        while True:
            try:
                print(f"[WHATSAPP] Launching bridge: {python_exe} {bridge_script}")
                whatsapp_bridge_process = subprocess.Popen([python_exe, bridge_script], cwd=bridge_dir)
                whatsapp_bridge_process.wait()
                print("[WHATSAPP] Bridge process exited. Restarting in 5s...")
            except Exception as e:
                print(f"[WHATSAPP] Bridge failure: {e}. Retrying in 5s...")
            
            time.sleep(5)

    whatsapp_thread = threading.Thread(target=run_whatsapp_bridge, daemon=True)
    whatsapp_thread.start()

    # Startup: Start Hotword Detection in a background thread
    hotword_thread = threading.Thread(target=hotword_detection_loop, daemon=True)
    hotword_thread.start()
    
    yield
    # Shutdown
    monitor_task.cancel()
    drain_task.cancel()
    try:
        await asyncio.gather(monitor_task, drain_task, return_exceptions=True)
    except asyncio.CancelledError:
        pass
    
    if whatsapp_bridge_process:
        print("[WHATSAPP] Terminating bridge...")
        whatsapp_bridge_process.terminate()
        try:
            whatsapp_bridge_process.wait(timeout=5)
        except:
            whatsapp_bridge_process.kill()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Real-time state
state = {
    "system": {
        "cpu": 0,
        "ram": 0,
        "disk": 0,
        "uptime": "0s",
        "db_health": "Linked"
    },
    "agents": [
        {"id": "jarvis_core", "name": "JARVIS Core", "status": "idle", "task": "Awaiting commands", "progress": 100},
    ],
    "logs": [],
    "chat_history": [],
    "telegram_history": []
}

start_time = time.time()

def get_uptime():
    uptime_seconds = int(time.time() - start_time)
    if uptime_seconds < 60: return f"{uptime_seconds}s"
    if uptime_seconds < 3600: return f"{uptime_seconds // 60}m {uptime_seconds % 60}s"
    return f"{uptime_seconds // 3600}h {(uptime_seconds % 3600) // 60}m"

async def system_monitor():
    while True:
        try:
            net = psutil.net_io_counters()
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            state["system"]["cpu"] = psutil.cpu_percent()
            state["system"]["ram"] = mem.percent
            state["system"]["disk"] = disk.percent
            state["system"]["uptime"] = get_uptime()
            
            # Detailed Hardware Specs
            state["system"]["ram_gb"] = f"{mem.used / (1024**3):.1f}GB / {mem.total / (1024**3):.1f}GB"
            state["system"]["disk_gb"] = f"{disk.used / (1024**3):.1f}GB / {disk.total / (1024**3):.1f}GB"
            state["system"]["cpu_cores"] = psutil.cpu_count(logical=True)
            try:
                state["system"]["cpu_freq"] = f"{psutil.cpu_freq().current/1000:.1f}GHz"
            except:
                state["system"]["cpu_freq"] = "3.2GHz"
                
            import random
            
            # WMI/GPU Mock or Static (too slow to run wmic every tick, so we simulate usage)
            state["system"]["gpu_name"] = "NVIDIA RTX Series / Integrated"
            state["system"]["gpu_usage"] = random.randint(5, 35)
            state["system"]["npu_name"] = "Neural Processor Sync"
            state["system"]["npu_usage"] = random.randint(1, 10)
            state["system"]["wifi_status"] = "Uplink Active (SECURE)"
            
            
            # Real hardware network telemetry
            state["system"]["net_packets_tx"] = f"{net.packets_sent / 1000000:.1f}M" if net.packets_sent > 1000000 else f"{net.packets_sent // 1000}K"
            state["system"]["net_packets_rx"] = f"{net.packets_recv / 1000000:.1f}M" if net.packets_recv > 1000000 else f"{net.packets_recv // 1000}K"
            
            # Count active sockets safely
            try:
                state["system"]["net_connections"] = len(psutil.net_connections())
            except Exception:
                state["system"]["net_connections"] = 0
                
            import random
            # Fake latency tracker that bounces realistically between 12-18ms
            state["system"]["net_latency"] = f"{random.uniform(12.0, 18.0):.1f} ms"
            
            await manager.broadcast(json.dumps({
                "type": "system_stats",
                "data": state["system"]
            }))
        except Exception as e:
            print(f"Monitor error: {e}")
        await asyncio.sleep(2)


async def handle_command(user_input: str, lang: str = "en", websocket: WebSocket = None):
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] PROCESSING COMMAND (Lang: {lang}): {user_input}")

    # Update chat history
    chat_msg = {"role": "user", "text": user_input, "ts": ts}
    state["chat_history"].append(chat_msg)
    
    # Broadcast log
    log_entry = {"ts": ts, "severity": "info", "source": "User", "message": f"Execute [{lang.upper()}]: {user_input}"}
    state["logs"].append(log_entry)
    
    await manager.broadcast(json.dumps({"type": "chat_update", "data": chat_msg}))
    await manager.broadcast(json.dumps({"type": "log", "data": log_entry}))

    # Update agent status
    state["agents"][0]["status"] = "busy"
    state["agents"][0]["task"] = f"Processing ({lang.upper()}): {user_input}"
    state["agents"][0]["progress"] = 30
    await manager.broadcast(json.dumps({"type": "agents_sync", "data": state["agents"]}))

    try:
        # Final prompt adjustment based on language
        final_input = user_input
        if lang == "hi":
            final_input += (
                "\n\nCRITICAL: Respond in a JSON format with two fields: "
                "1. 'display_text': Casual, friendly Hinglish (Roman script, like friends talking). "
                "2. 'tts_text': Same meaning but in proper Hindi (Devanagari script) with clear pauses. "
                "Tone: Informal, using 'bhai'. Return ONLY JSON."
            )
        
        # Actual Jarvis call
        response = await asyncio.to_thread(agent.invoke, 
            {"messages": [{"role": "user", "content": final_input}]},
            {"configurable": {"thread_id": "dashboard_real"}},
        )
        
        if "messages" not in response or len(response["messages"]) == 0:
            print(f"[{ts}] ERROR: Agent returned no messages")
            return

        res_content = response["messages"][-1].content
        res_ts = time.strftime("%H:%M:%S")

        # Extract AI thought process
        thought_steps = []
        for msg in response["messages"]:
            has_tool_calls = hasattr(msg, "tool_calls") and msg.tool_calls
            is_human = hasattr(msg, "type") and msg.type == "human"
            is_tool = hasattr(msg, "type") and msg.type == "tool"
            is_ai = hasattr(msg, "type") and msg.type == "ai"

            if is_human: continue

            if is_ai and has_tool_calls:
                for tc in msg.tool_calls:
                    name = tc.get("name") if isinstance(tc, dict) else getattr(tc, "name", "tool")
                    args = tc.get("args") if isinstance(tc, dict) else getattr(tc, "args", {})
                    thought_steps.append({"type": "tool_call", "label": f"Calling: {name}", "detail": str(args)[:120]})
            elif is_tool:
                thought_steps.append({"type": "tool_result", "label": f"Tool Result", "detail": str(msg.content)[:150]})
            elif is_ai and not has_tool_calls:
                content_str = str(msg.content).strip()
                if content_str and content_str != res_content.strip():
                    thought_steps.append({"type": "reasoning", "label": "Intermediate Reasoning", "detail": content_str[:120]})

        thought_steps.append({"type": "final", "label": "Final Response Generated", "detail": str(res_content).strip()[:120]})

        await manager.broadcast(json.dumps({
            "type": "thought_process",
            "data": {"steps": thought_steps, "ts": res_ts, "query": user_input}
        }))

        # Clean markdown formatting from the response
        cleaned_content = res_content.strip()
        for prefix in ["```json", "```"]:
            if cleaned_content.startswith(prefix): cleaned_content = cleaned_content[len(prefix):]
        if cleaned_content.endswith("```"): cleaned_content = cleaned_content.rsplit("```", 1)[0]
        cleaned_content = cleaned_content.strip()

        display_text = cleaned_content
        try:
            parsed_json = json.loads(cleaned_content)
            if "display_text" in parsed_json: display_text = parsed_json["display_text"]
        except: pass

        print(f"[{res_ts}] JARVIS RESPONSE: {display_text}")

        # Update history & logs
        res_chat = {"role": "jarvis", "text": display_text, "ts": res_ts}
        res_log = {"ts": res_ts, "severity": "success", "source": "Jarvis", "message": "Response generated"}
        
        state["chat_history"].append(res_chat)
        state["logs"].append(res_log)
        state["agents"][0]["progress"] = 100

        await manager.broadcast(json.dumps({"type": "chat_update", "data": res_chat}))
        await manager.broadcast(json.dumps({"type": "log", "data": res_log}))
        
        # Send back specifically to the requester if WS provided
        if websocket:
            await websocket.send_text(json.dumps({"type": "response", "data": cleaned_content}))
        else:
            await manager.broadcast(json.dumps({"type": "response", "data": cleaned_content}))

    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] ERROR in Agent: {e}")
        err_log = {"ts": time.strftime("%H:%M:%S"), "severity": "error", "source": "Core", "message": str(e)}
        state["logs"].append(err_log)
        await manager.broadcast(json.dumps({"type": "log", "data": err_log}))
    
    finally:
        state["agents"][0]["status"] = "idle"
        state["agents"][0]["task"] = "Awaiting commands"
        state["agents"][0]["progress"] = 100
        await manager.broadcast(json.dumps({"type": "agents_sync", "data": state["agents"]}))
        
        # Reset the voice listening lock so we can hear 'hey jarvis' again for the next command
        global is_listening_to_command, last_command_finished_time
        is_listening_to_command = False
        last_command_finished_time = time.time()

current_command_task = None

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global current_command_task
    await manager.connect(websocket)
    try:
        await websocket.send_text(json.dumps({"type": "init_state", "data": state}))
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "command":
                current_command_task = asyncio.create_task(handle_command(message.get("data"), message.get("lang", "en"), websocket))
            elif message.get("type") == "kill_command":
                if current_command_task and not current_command_task.done():
                    current_command_task.cancel()
                    current_command_task = None
            elif message.get("type") == "set_language":
                global current_language
                current_language = message.get("lang", "en")
                print(f"[SYSTEM] Voice Command Language protocol set to: {current_language}")
            elif message.get("type") == "speaking_state":
                global is_speaking_response
                is_speaking_response = message.get("speaking", False)
                print(f"[SYSTEM] Speaking status updated to: {is_speaking_response}")
            elif message.get("type") == "start_voice":
                threading.Thread(target=process_voice_command, daemon=True).start()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WS error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
