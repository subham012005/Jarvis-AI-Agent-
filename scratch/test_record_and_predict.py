import os
import sys
import time
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
from openwakeword.model import Model

# Fix standard output encoding for clean console visuals on Windows
sys.stdout.reconfigure(encoding='utf-8')

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
model_path = os.path.join(base_dir, "hey_jarvis.onnx")
mel_path = os.path.join(base_dir, "melspectrogram.onnx")
emb_path = os.path.join(base_dir, "embedding.onnx")

print("="*60)
print("     J.A.R.V.I.S. VOICE RECORDING & ANALYSIS DIAGNOSTIC")
print("="*60)

# Load Model
print("\nLoading openWakeWord model...")
try:
    oww_model = Model(
        wakeword_models=[model_path], 
        inference_framework="onnx",
        melspec_model_path=mel_path if os.path.exists(mel_path) else None,
        embedding_model_path=emb_path if os.path.exists(emb_path) else None
    )
    print("👉 Model loaded successfully!")
except Exception as e:
    print("❌ Error loading model:", e)
    sys.exit(1)

# List input devices
default_input = sd.query_devices(kind='input')
print(f"👉 Capturing from: {default_input['name']}")

print("\n--- INSTRUCTIONS ---")
print("We are going to record 5 seconds of audio.")
print("When you start, speak clearly into the microphone:")
print("Say 'Hey Jarvis' or 'Jarvis' a few times.")
print("---------------------\n")

input("Press ENTER to start recording...")

print("\n🔴 RECORDING... Speak now!")
fs = 16000
duration = 5 # seconds
recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
sd.wait() # Wait until recording is finished
print("🟢 RECORDING COMPLETE!")

# Save to wav file
output_wav = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_voice.wav"))
wav.write(output_wav, fs, recording)
print(f"👉 Saved audio to: {output_wav}")

# Calculate volume/quality metrics
rms = np.sqrt(np.mean(recording.astype(np.float32)**2))
print(f"👉 Audio Volume Level (RMS): {rms:.2f}")
if rms < 100:
    print("⚠️ Warning: Audio level is extremely low! The recording might be silent or muted.")
elif rms > 15000:
    print("⚠️ Warning: Audio level is extremely high! It might be clipping/distorted.")
else:
    print("✅ Volume level looks standard!")

# Run openwakeword analysis on the saved wav file
print("\nAnalyzing recording with openWakeWord...")
try:
    # predict_clip returns a list of dictionaries with predictions for each chunk
    predictions = oww_model.predict_clip(output_wav)
    
    scores = [p.get('hey_jarvis', 0.0) for p in predictions]
    max_score = max(scores) if scores else 0.0
    
    print(f"👉 Maximum 'hey_jarvis' score achieved: {max_score:.4f}")
    
    if max_score > 0.5:
        print("\n🎉 SUCCESS! The model successfully recognized the wake word in the audio clip!")
    elif max_score > 0.2:
        print("\n👀 SO CLOSE! The model detected something resembling the wake word, but it didn't cross the 0.5 confidence threshold.")
        print("Tip: Try saying 'Hey Jarvis' with distinct pronunciation (HAY-JAR-VIS) or speaking slightly louder/closer to the mic.")
    else:
        print("\n❌ NOT DETECTED: The model did not recognize 'Hey Jarvis' at all in the clip.")
        print("Tip: Open the file 'scratch/test_voice.wav' on your PC and listen to it. Is it quiet, noisy, or distorted? This will show you exactly what Python is hearing.")
except Exception as e:
    print("❌ Error analyzing clip:", e)
