from playwright.sync_api import sync_playwright
import pyttsx3
BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"  # Adjust as needed

def speak_ai(text):
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=BRAVE_PATH, headless=False)
        page = browser.new_page()
        page.goto("https://openai.fm/")

        # Select voice
        page.click("div.Button_Button__u2RFO:has-text('nyx')")

        # Fill prompt
        page.wait_for_selector("#prompt")
        page.fill("#prompt", text)

        # Click Play button
        play_button_selector = "div.Button_Button__u2RFO:has-text('Play')"
        page.click(play_button_selector)

        # Wait for button text to return to "Play" (after playback)
        
        try:
            page.wait_for_function("""
                () => {
                    const buttons = document.querySelectorAll('div.Button_Button__u2RFO');
                    return Array.from(buttons).some(btn => btn.textContent.trim() === 'Play');
                }
            """, timeout=90000)
        except TimeoutError:
            print("⚠️ TTS playback timeout — skipping wait.")

        browser.close()


import asyncio
import edge_tts
import sounddevice as sd
import io
import soundfile as sf
import threading
import keyboard  # Install with: pip install keyboard

# Flag to stop playback
stop_flag = False

def listen_for_stop():
    global stop_flag
    keyboard.wait('s')  # Wait until 's' key is pressed
    stop_flag = True
    sd.stop()           # Stop playback immediately

async def async_speak(text):
    global stop_flag
    stop_flag = False

    communicate = edge_tts.Communicate(text, voice="en-US-AriaNeural")
    wav_bytes = b""

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            wav_bytes += chunk["data"]
            if stop_flag:
                return

    with io.BytesIO(wav_bytes) as f:
        data, samplerate = sf.read(f, dtype='float32')
        if not stop_flag:
            sd.play(data, samplerate)
            while sd.get_stream().active:
                if stop_flag:
                    sd.stop()
                    break

def speak(text):
    # Start keyboard listener in a separate thread
    try:
        listener_thread = threading.Thread(target=listen_for_stop, daemon=True)
        listener_thread.start()

    # Run the async speak function
        asyncio.run(async_speak(f".. {text}"))
    except :
        raise Exception("Error in speaking the text. Please check your setup and internet connection.")
 
 
 
        



