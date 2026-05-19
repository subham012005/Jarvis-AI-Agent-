import os
import time
import requests
from dotenv import load_dotenv

# ================== ENV SETUP ==================
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

if not BOT_TOKEN or not CHAT_ID:
    raise RuntimeError("BOT_TOKEN or CHAT_ID not set in .env file")

BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"


# ================== SEND MESSAGE ==================
def send_telegram_message(text: str, retries: int = 3):
    url = f"{BASE_URL}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text
    }

    for attempt in range(retries):
        try:
            res = requests.post(url, json=payload, timeout=30)
            data = res.json()

            if data.get("ok"):
                return data

            print("Telegram API error:", data)

        except requests.exceptions.RequestException as e:
            print(f"[SendMessage] Attempt {attempt + 1} failed:", e)
            time.sleep(5)

    return None  # NEVER crash app

# ================== SEND DOCUMENT ==================
def send_telegram_document(file_path: str, caption: str = "", retries: int = 3):
    url = f"{BASE_URL}/sendDocument"
    
    if not os.path.exists(file_path):
        return None
        
    for attempt in range(retries):
        try:
            with open(file_path, 'rb') as f:
                files = {'document': f}
                data = {'chat_id': CHAT_ID, 'caption': caption}
                res = requests.post(url, data=data, files=files, timeout=60)
                res_data = res.json()
                
                if res_data.get("ok"):
                    return res_data
                    
                print("Telegram API error:", res_data)
        except requests.exceptions.RequestException as e:
            print(f"[SendDocument] Attempt {attempt + 1} failed:", e)
            time.sleep(5)
            
    return None


# ================== FETCH MESSAGES ==================
def fetch_telegram_messages(offset: int | None = None):
    url = f"{BASE_URL}/getUpdates"

    params = {
        "timeout": 50  # long polling
    }

    if offset is not None:
        params["offset"] = offset

    try:
        res = requests.get(url, params=params, timeout=70)
        data = res.json()

        if not data.get("ok"):
            print("Telegram API error:", data)
            return []

        return data["result"]

    except requests.exceptions.ReadTimeout:
        # Normal for long polling
        return []

    except requests.exceptions.RequestException as e:
        print("[FetchUpdates] Network error:", e)
        time.sleep(10)
        return []