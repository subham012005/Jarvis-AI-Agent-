import os
import sys
import time
import threading
import numpy as np
import sounddevice as sd
from openwakeword.model import Model

# Add parent dir to path for imports
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

try:
    from voice_and_speak.voice_utils import speak
    from main_and_prompt.jarviss import agent
    import speech_recognition as sr
except ImportError as e:
    print(f"Import error: {e}")
    def speak(t): print(f"SPEAK: {t}")
    agent = None

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "hey_jarvis.onnx")
MEL_PATH = os.path.join(BASE_DIR, "melspectrogram.onnx")
EMB_PATH = os.path.join(BASE_DIR, "embedding.onnx")

def main():
    print("[🟢] Initializing J.A.R.V.I.S. Hotword Detection (openWakeWord)...")
    
    if not os.path.exists(MODEL_PATH):
        print(f"[❌] Critical Error: Model file not found at {MODEL_PATH}")
        return

    # Load Model
    oww_model = Model(
        wakeword_models=[MODEL_PATH],
        inference_framework="onnx",
        melspec_model_path=MEL_PATH if os.path.exists(MEL_PATH) else None,
        embedding_model_path=EMB_PATH if os.path.exists(EMB_PATH) else None
    )

    print(f"[🎤] Listening for 'Jarvis'...")
    speak("System online. Listening for your command, sir.")

    is_listening = False
    recognizer = sr.Recognizer()

    def process_command():
        nonlocal is_listening
        is_listening = True
        try:
            print("[🎤] Listening for command...")
            
            # Play premium sci-fi initialization chime
            try:
                import winsound
                winsound.Beep(2000, 80)
                winsound.Beep(2600, 120)
            except Exception:
                pass
            
            # Listen for command
            with sd.RawInputStream(samplerate=16000, blocksize=16000*5, dtype='int16', channels=1) as stream:
                recording, overflowed = stream.read(16000 * 5) # 5 seconds
                audio_data = sr.AudioData(recording, 16000, 2)
            
            print("[🧠] Recognizing...")
            user_input = recognizer.recognize_google(audio_data)
            print(f"[💬] You said: {user_input}")
            
            # Play sci-fi success feedback chime
            try:
                import winsound
                winsound.Beep(2600, 100)
            except Exception:
                pass
            
            if agent:
                print("[🤖] Jarvis is thinking...")
                response = agent.invoke(
                    {"messages": [{"role": "user", "content": user_input}]},
                    {"configurable": {"thread_id": "standalone_voice"}},
                )
                res_content = response["messages"][-1].content
                print(f"[🤖] Jarvis: {res_content}")
                speak(res_content)
            else:
                print("[❌] Agent not available.")
                
        except sr.UnknownValueError:
            print("[❓] Could not understand audio.")
            # Play a failure chime
            try:
                import winsound
                winsound.Beep(1200, 100)
                winsound.Beep(800, 150)
            except Exception:
                pass
        except Exception as e:
            print(f"[❌] Error processing command: {e}")
        finally:
            is_listening = False
            print("[🎤] Returning to hotword detection...")

    def audio_callback(indata, frames, time_info, status):
        if is_listening:
            return
            
        # Predict using openWakeWord
        prediction = oww_model.predict(indata)
        
        for model_name, score in prediction.items():
            if score > 0.5: # Slightly more sensitive
                print(f"[🔥] Detected '{model_name}'! Score: {score:.2f}")
                threading.Thread(target=process_command, daemon=True).start()

    # Start audio stream
    try:
        with sd.InputStream(samplerate=16000, 
                            channels=1, 
                            blocksize=1280, 
                            callback=audio_callback):
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\n[✋] Shutting down...")
    except Exception as e:
        print(f"[❌] Audio Error: {e}")

if __name__ == "__main__":
    main()
