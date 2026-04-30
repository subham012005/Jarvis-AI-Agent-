import time
import struct
import pyaudio
import pvporcupine  # assuming you're using Picovoice
from voice_and_speak.voice_utils import speak # your async speak function wrapper
from main_and_prompt.jarviss import run_jarvis 
# Define hotwords and Porcupine
keywords = ["jarvis", "picovoice"]
porcupine = pvporcupine.create(keywords=keywords)

p = pyaudio.PyAudio()
stream = None

try:
    # Try to open audio stream
    stream = p.open(
        rate=porcupine.sample_rate,
        channels=1,
        format=pyaudio.paInt16,
        input=True,
        frames_per_buffer=porcupine.frame_length
    )

    print("[🟢] Listening... Say 'Jarvis' to activate or 'Picovoice' to exit.")
    speak("Listening... Say 'Jarvis' to activate or 'Picovoice' to exit.")

    count = 0
    while True:
        try:
            pcm = stream.read(porcupine.frame_length, exception_on_overflow=False)
            pcm = struct.unpack_from("h" * porcupine.frame_length, pcm)
            index = porcupine.process(pcm)
        except OSError as e:
            print("[❌] Error reading audio stream:", e)
            break

        if index >= 0:
            keyword = keywords[index]
            count += 1
            print(f"[🎤] Hotword '{keyword}' detected! Count: {count}") 
            speak(f"Hotword '{keyword}' detected! Count: {count}")

            if keyword == "picovoice":
                print("[🛑] Terminate command detected. Shutting down...")
                speak("Terminate command detected. Shutting down...")
                break

            # Call your assistant
             # Import the function to run your assistant
            run_jarvis()

            time.sleep(1.5)
            print("[🕓] Waiting again...")                                                      
            
            speak("Waiting again for your command, sir.")

except KeyboardInterrupt:
    print("\n[✋] Exiting hotword listener manually.")  
    
    speak("Exiting hotword listener manually.")

finally:
    if stream:
        if stream.is_active():
            stream.stop_stream()
        stream.close()
    porcupine.delete()
    p.terminate()
