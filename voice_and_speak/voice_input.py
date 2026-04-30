import speech_recognition as sr

def get_mic_index(preferred=1, fallback=0):
    mic_names = sr.Microphone.list_microphone_names()
    if preferred < len(mic_names):
        print(f"Preferred mic found: {mic_names[preferred]} (index {preferred})")
        return preferred
    else: 
        print(f"Preferred mic index {preferred} not found. Falling back to index {fallback}: {mic_names[fallback]}")
        return fallback

def listen_cmd(mic_index):
    r = sr.Recognizer()
    with sr.Microphone(device_index=mic_index) as source:
        print(f"Listening on mic index {mic_index}...")
        r.pause_threshold = 1
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source, 10, 6)

    try:
        print("Recognizing...")
        query = r.recognize_google(audio, language='en-in')
        return query
    except Exception as e:
        print("Error occurred:", e)
        return "exit"




