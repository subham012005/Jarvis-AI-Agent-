import os
import sys

print("Python executable:", sys.executable)

try:
    import sounddevice as sd
    print("sounddevice is installed!")
    devices = sd.query_devices()
    print("\n--- Available Audio Devices ---")
    for i, dev in enumerate(devices):
        print(f"Device {i}: {dev['name']} (Inputs: {dev['max_input_channels']}, Outputs: {dev['max_output_channels']})")
    
    default_input = sd.query_devices(kind='input')
    print("\nDefault Input Device:", default_input['name'])
except Exception as e:
    print("Error importing/querying sounddevice:", e)

try:
    import openwakeword
    print("\nopenwakeword is installed!")
    from openwakeword.model import Model
    print("openwakeword.model.Model imported successfully!")
except Exception as e:
    print("Error importing openwakeword:", e)

try:
    import speech_recognition as sr
    print("\nspeech_recognition is installed!")
except Exception as e:
    print("Error importing speech_recognition:", e)
