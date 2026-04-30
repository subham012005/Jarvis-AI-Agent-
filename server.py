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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Async task that drains the thread-safe queue and broadcasts to WebSocket clients
    async def telegram_queue_drain():
        while True:
            try:
                msg = _telegram_queue.get_nowait()
                print(f"[TELEGRAM] Broadcasting to {len(manager.active_connections)} client(s)")
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
    
    yield
    # Shutdown
    monitor_task.cancel()
    drain_task.cancel()
    try:
        await asyncio.gather(monitor_task, drain_task, return_exceptions=True)
    except asyncio.CancelledError:
        pass

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
            state["system"]["cpu"] = psutil.cpu_percent()
            state["system"]["ram"] = psutil.virtual_memory().percent
            state["system"]["disk"] = psutil.disk_usage('/').percent
            state["system"]["uptime"] = get_uptime()
            
            await manager.broadcast(json.dumps({
                "type": "system_stats",
                "data": state["system"]
            }))
        except Exception as e:
            print(f"Monitor error: {e}")
        await asyncio.sleep(2)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Initial state sync — includes telegram_history so Network tab is populated immediately
        await websocket.send_text(json.dumps({"type": "init_state", "data": state}))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "command":
                user_input = message.get("data")
                lang = message.get("lang", "en")
                ts = time.strftime("%H:%M:%S")
                
                # Print to terminal
                print(f"[{ts}] REQUEST FROM FRONTEND (Lang: {lang}): {user_input}")

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
                    response = agent.invoke(
                        {"messages": [{"role": "user", "content": final_input}]},
                        {"configurable": {"thread_id": "dashboard_real"}},
                    )
                    
                    res_content = response["messages"][-1].content
                    res_ts = time.strftime("%H:%M:%S")

                    # Debug: print message types to terminal
                    print(f"[THOUGHT] Total messages in chain: {len(response['messages'])}")
                    for i, msg in enumerate(response["messages"]):
                        print(f"[THOUGHT] msg[{i}]: {type(msg).__name__} | tool_calls={getattr(msg, 'tool_calls', None)} | content_len={len(str(getattr(msg, 'content', ''))[:60])}")

                    # Extract AI thought process - use attribute presence, not class name
                    thought_steps = []
                    for msg in response["messages"]:
                        has_tool_calls = hasattr(msg, "tool_calls") and msg.tool_calls
                        is_human = hasattr(msg, "type") and msg.type == "human"
                        is_tool = hasattr(msg, "type") and msg.type == "tool"
                        is_ai = hasattr(msg, "type") and msg.type == "ai"

                        if is_human:
                            continue  # skip the user message

                        if is_ai and has_tool_calls:
                            for tc in msg.tool_calls:
                                name = tc.get("name") if isinstance(tc, dict) else getattr(tc, "name", "tool")
                                args = tc.get("args") if isinstance(tc, dict) else getattr(tc, "args", {})
                                thought_steps.append({
                                    "type": "tool_call",
                                    "label": f"Calling: {name}",
                                    "detail": str(args)[:120]
                                })
                        elif is_tool:
                            thought_steps.append({
                                "type": "tool_result",
                                "label": f"Tool Result",
                                "detail": str(msg.content)[:150]
                            })
                        elif is_ai and not has_tool_calls:
                            content_str = str(msg.content).strip()
                            if content_str and content_str != res_content.strip():
                                thought_steps.append({
                                    "type": "reasoning",
                                    "label": "Intermediate Reasoning",
                                    "detail": content_str[:120]
                                })

                    # Always add the final step
                    thought_steps.append({
                        "type": "final",
                        "label": "Final Response Generated",
                        "detail": str(res_content).strip()[:120]
                    })

                    print(f"[THOUGHT] Broadcasting {len(thought_steps)} steps")
                    await manager.broadcast(json.dumps({
                        "type": "thought_process",
                        "data": {"steps": thought_steps, "ts": res_ts, "query": user_input}
                    }))

                    # Clean markdown formatting from the response
                    cleaned_content = res_content.strip()
                    if cleaned_content.startswith("```json"):
                        cleaned_content = cleaned_content.split("```json")[1]
                    if cleaned_content.startswith("```"):
                        cleaned_content = cleaned_content.split("```")[1]
                    if cleaned_content.endswith("```"):
                        cleaned_content = cleaned_content.rsplit("```", 1)[0]
                    cleaned_content = cleaned_content.strip()

                    display_text = cleaned_content
                    try:
                        parsed_json = json.loads(cleaned_content)
                        if "display_text" in parsed_json:
                            display_text = parsed_json["display_text"]
                    except Exception as e:
                        print(f"[{res_ts}] JSON Parse Warning: {e}")

                    print(f"[{res_ts}] JARVIS RESPONSE: {display_text}")

                    # Agent progress update
                    state["agents"][0]["progress"] = 100
                    
                    # Update history & logs with clean display_text
                    res_chat = {"role": "jarvis", "text": display_text, "ts": res_ts}
                    res_log = {"ts": res_ts, "severity": "success", "source": "Jarvis", "message": "Response generated"}
                    
                    state["chat_history"].append(res_chat)
                    state["logs"].append(res_log)

                    await manager.broadcast(json.dumps({"type": "chat_update", "data": res_chat}))
                    await manager.broadcast(json.dumps({"type": "log", "data": res_log}))
                    await websocket.send_text(json.dumps({"type": "response", "data": cleaned_content}))

                except Exception as e:
                    print(f"[{time.strftime('%H:%M:%S')}] ERROR in Agent: {e}")
                    err_log = {"ts": time.strftime("%H:%M:%S"), "severity": "error", "source": "Core", "message": str(e)}
                    state["logs"].append(err_log)
                    await manager.broadcast(json.dumps({"type": "log", "data": err_log}))
                
                # Final agent sync
                state["agents"][0]["status"] = "idle"
                state["agents"][0]["task"] = "Awaiting commands"
                state["agents"][0]["progress"] = 100
                await manager.broadcast(json.dumps({"type": "agents_sync", "data": state["agents"]}))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WS error: {e}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
