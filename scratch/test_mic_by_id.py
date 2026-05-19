import os
import sys
import time
import numpy as np
import sounddevice as sd

sys.stdout.reconfigure(encoding='utf-8')

print("="*60)
print("       J.A.R.V.I.S. MICROPHONE SELECTION & LEVEL TESTER")
print("="*60)

devices = sd.query_devices()
input_devices = []

print("\n--- AVAILABLE INPUT MICROPHONES ---")
for i, dev in enumerate(devices):
    if dev['max_input_channels'] > 0:
        input_devices.append(i)
        default_input_id = sd.default.device[0]
        default_marker = "⭐ [DEFAULT]" if i == default_input_id else ""
        print(f"Device ID {i}: {dev['name']} {default_marker}")

print("\n------------------------------------------------------------")
print("If the default microphone is not capturing sound, please run:")
print("python scratch/test_mic_by_id.py <Device_ID_Number>")
print("Example: python scratch/test_mic_by_id.py 6")
print("------------------------------------------------------------\n")

# Use device ID from argument if provided, otherwise default
selected_device = None
if len(sys.argv) > 1:
    try:
        selected_device = int(sys.argv[1])
        print(f"Testing Selected Device ID: {selected_device} ({devices[selected_device]['name']})")
    except Exception as e:
        print(f"Invalid device ID. Defaulting to system input.")
        selected_device = None

if selected_device is None:
    selected_device = sd.default.device[0]
    print(f"Testing Default Device ID: {selected_device} ({devices[selected_device]['name']})")

print("\nStarting live sound level capture. Speak, clap, or tap the mic!")
print("Press Ctrl+C to stop.\n")

def audio_callback(indata, frames, time_info, status):
    # Calculate audio energy (RMS)
    audio_data = indata.flatten()
    rms = np.sqrt(np.mean(audio_data.astype(np.float32)**2))
    
    # Scale for visualization
    level = int(min(rms * 50, 1) * 30)  # sd.InputStream with float32 yields values between -1.0 and 1.0
    level_bar = "█" * level + "░" * (30 - level)
    
    sys.stdout.write(f"\r🎤 Mic Volume Level: [{level_bar}] (Raw RMS: {rms:.6f})")
    sys.stdout.flush()

try:
    with sd.InputStream(
        device=selected_device,
        samplerate=16000,
        blocksize=1024,
        dtype='float32',
        channels=1,
        callback=audio_callback
    ):
        while True:
            time.sleep(0.1)
except KeyboardInterrupt:
    print("\n\n[🟢] Level test ended.")
except Exception as e:
    print(f"\n❌ Error starting input stream on Device {selected_device}: {e}")
