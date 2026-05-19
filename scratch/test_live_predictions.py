import os
import sys
import time
import numpy as np
import sounddevice as sd
from openwakeword.model import Model

# Fix standard output encoding for clean console visuals on Windows
sys.stdout.reconfigure(encoding='utf-8')

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
model_path = os.path.join(base_dir, "hey_jarvis.onnx")
mel_path = os.path.join(base_dir, "melspectrogram.onnx")
emb_path = os.path.join(base_dir, "embedding.onnx")

print("="*60)
print("   J.A.R.V.I.S. MICROPHONE & HOTWORD DIAGNOSTIC TOOL")
print("="*60)

print("\n[1/3] Loading AI Models...")
try:
    oww_model = Model(
        wakeword_models=[model_path], 
        inference_framework="onnx",
        melspec_model_path=mel_path if os.path.exists(mel_path) else None,
        embedding_model_path=emb_path if os.path.exists(emb_path) else None
    )
    print("👉 Success: openWakeWord model loaded successfully!")
except Exception as e:
    print("❌ Error loading model:", e)
    sys.exit(1)

print("\n[2/3] Checking Microphone...")
try:
    default_input = sd.query_devices(kind='input')
    print(f"👉 Default Input Device: {default_input['name']}")
    print(f"👉 Sample Rate: 16000Hz (Required)")
except Exception as e:
    print("❌ Error: No default microphone found!", e)
    sys.exit(1)

print("\n[3/3] Starting Live Listening...")
print("Instructions:")
print("1. Speak or clap to see if the 'Mic Level' bar moves.")
print("2. Say 'Jarvis' or 'Hey Jarvis' clearly.")
print("3. Check the 'Confidence Score' below.\n")
print("-"*60)
print(f"{'Mic Level':<20} | {'Jarvis Confidence':<20} | {'Status':<15}")
print("-"*60)

def audio_callback(indata, frames, time_info, status):
    # Flatten audio input to 1D array
    audio_data = indata.flatten()
    
    # Calculate audio energy / volume level for visual feedback
    # Root-mean-square (RMS) level
    rms = np.sqrt(np.mean(audio_data.astype(np.float32)**2))
    # Normalize to 0-30 scale for display
    level = int(min(rms / 500, 1) * 20)
    level_bar = "█" * level + "░" * (20 - level)

    # Predict using openWakeWord
    prediction = oww_model.predict(audio_data)
    
    # Get the confidence score for hey_jarvis
    score = prediction.get('hey_jarvis', 0.0)
    
    # Determine Status
    if score > 0.5:
        status_text = "🔥 DETECTED!"
    elif score > 0.2:
        status_text = "👀 Hearing something..."
    else:
        status_text = "Listening..."

    # Print live visual row with carriage return to overwrite line
    sys.stdout.write(f"\r[{level_bar}] | Score: {score:.4f}          | {status_text:<15}")
    sys.stdout.flush()

try:
    with sd.InputStream(
        samplerate=16000,
        blocksize=1280,
        dtype='int16',
        channels=1,
        callback=audio_callback
    ):
        while True:
            time.sleep(0.1)
except KeyboardInterrupt:
    print("\n\n[🟢] Diagnostics ended by user.")
except Exception as e:
    print(f"\n❌ Audio Stream Error: {e}")
