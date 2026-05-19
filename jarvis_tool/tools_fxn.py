import sqlite3
import webbrowser
import subprocess
import os
from pathlib import Path
import pyautogui
import time
import urllib.parse
import pygetwindow as gw
import easyocr
import numpy as np
import requests
from playwright.sync_api import sync_playwright
import threading

# Global browser manager
class BrowserManager:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.pw = None
        self.browser = None
        self.context = None
        self.page = None

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def start(self):
        if not self.pw:
            self.pw = sync_playwright().start()
            self.browser = self.pw.chromium.launch(headless=False) # Headless=False to see the video
            self.context = self.browser.new_context()
            self.page = self.context.new_page()
        return self.page

    def get_page(self):
        if not self.page:
            return self.start()
        return self.page

    def close(self):
        if self.browser:
            self.browser.close()
        if self.pw:
            self.pw.stop()
        self.pw = None
        self.browser = None
        self.context = None
        self.page = None

browser_manager = BrowserManager.get_instance()

# to get current time and date
def get_current_time(_: str = None) -> str:
    """Returns the current date and time as a string."""
    import time
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())


# Mapping common system apps to Windows shell commands or URI schemes
SYSTEM_APPS = {
    "cmd": "cmd",
    "camera": "microsoft.windows.camera:",
    "notepad": "notepad",
    "settings": "ms-settings:",
    "file explorer": "explorer",
    "microsoft edge": "msedge",
    "task manager": "taskmgr",
    # add more as needed
}

# Common install locations and user folders to search
COMMON_PATHS = [
    Path(os.environ.get("ProgramFiles", "C:\\Program Files")),
    Path(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")),
    Path(os.environ.get("LOCALAPPDATA", "")),
    Path(os.path.expanduser("~\\Desktop")),
    Path(os.path.expanduser("~\\Documents")),
    Path(os.path.expanduser("~\\Downloads")),
    Path(os.path.expanduser("~\\Pictures")),
    Path(os.path.expanduser("~\\Videos")),
]

def get_path(input_str: str) -> Path | str | None:
    input_str = input_str.strip().lower()

    # 1. Check if it's a system app
    if input_str in SYSTEM_APPS:
        return SYSTEM_APPS[input_str]  # Return command/URI as-is

    # 2. Check if it's a direct file path
    input_path = Path(input_str)
    if input_path.exists():
        return input_path

    # 3. Treat as executable name
    exe_name = input_str if input_str.endswith(".exe") else input_str + ".exe"

    # Check in system PATH
    for path_dir in os.environ["PATH"].split(os.pathsep):
        candidate = Path(path_dir) / exe_name
        if candidate.exists():
            return candidate

    # 4. Search common install locations
    for base_path in COMMON_PATHS:
        if not base_path.exists():
            continue
        for root, dirs, files in os.walk(base_path):
            if exe_name in files:
                return Path(root) / exe_name
    return None  # Return as-is if not found


    
# Function to open a website
def open_website(input_data: str) -> str:
    """Opens a website in the specified web browser."""
    
    try:
        parts = input_data.split(',')
        url = parts[0].strip()
        browser_path = parts[1].strip()
        incognito = False
        if len(parts) > 2 and parts[2].strip().lower() == 'true':
            incognito = True
            
        if ('.exe' not in browser_path):
            browser_path = get_path(browser_path)
        else:
        # Clean up whitespace
            browser_path = browser_path.strip()
            
        # Escape backslashes or use raw string
        browser_path = str(browser_path).replace("\\", "\\\\")
        
        if incognito:
            lower_path = browser_path.lower()
            if 'chrome' in lower_path or 'brave' in lower_path:
                browser_path += " --incognito"
            elif 'edge' in lower_path or 'msedge' in lower_path:
                browser_path += " -inprivate"
            elif 'firefox' in lower_path:
                browser_path += " -private-window"
            elif 'opera' in lower_path:
                browser_path += " --private"
        
        # Register the browser
        webbrowser.get(browser_path+" %s").open(url)
        
        return f"Website '{url}' has been opened in your specified browser{' in incognito mode' if incognito else ''}."
    except Exception as e:
        return f"Failed to open website: {e}"
    
def get_contact_phone(name):
    conn = sqlite3.connect("contacts.db")
    cursor = conn.cursor()
    cursor.execute("SELECT phone FROM contacts WHERE name = ?", (name.lower(),))
    result = cursor.fetchone()
    conn.close()
    if result:
        return result[0]
    else:
        return None




def message_call_whatsapp(string_input: str) :
    # input sting format : mobile_no,message,flag,name
    string = string_input.split('$')
    if len(string) < 4:
        return f"Error: Invalid input format. Expected 'mobile_no $ message $ flag $ name', but got {len(string)} parts. Please try again with the correct format."
    
    mobile_no,message,flag,name = string[0].strip(), string[1].strip(), string[2].strip(), string[3].strip()
    
    # clean mobile number
    mobile_no = mobile_no.replace(" ", "").replace("+", "")
    if mobile_no.startswith("91") and len(mobile_no) > 10:
        pass # already has 91
    elif len(mobile_no) == 10:
        mobile_no = "91" + mobile_no
        
    print(f"mobile_no : {mobile_no} , message : {message} , flag : {flag} , name : {name}")
    
    if not mobile_no.isdigit():
        if get_contact_phone(name.lower()) is not None:
            mobile_no = get_contact_phone(name.lower())
        elif get_contact_phone(mobile_no.lower()) is not None:
            mobile_no = get_contact_phone(mobile_no.lower())
        else:
            return "Please provide a valid mobile number."
    
    # Clean again after lookup
    mobile_no = str(mobile_no).replace(" ", "").replace("+", "")
    if len(mobile_no) == 10:
        mobile_no = "91" + mobile_no

    try:
        if flag.lower() == 'message':
            # Use the new WhatsApp Bridge API
            print(f"[WHATSAPP] Sending message to {mobile_no} via bridge...")
            try:
                response = requests.post(
                    "http://127.0.0.1:8081/api/send",
                    json={"recipient": mobile_no, "message": message},
                    timeout=15
                )
                if response.status_code == 200:
                    return f"Message sent successfully to {name} ({mobile_no})"
                else:
                    return f"Failed to send message via bridge: {response.text}"
            except Exception as bridge_err:
                print(f"[WHATSAPP] Bridge error: {bridge_err}")
                return f"Error connecting to WhatsApp bridge. Please ensure it's running."
        
        elif 'call' in flag.lower() :
            # Keep legacy automation for calls as bridge doesn't support them yet
            if 'video' in flag.lower():
                target_tab = 11
                jarvis_message = f'video call started with {name}'
            elif 'voice' in flag.lower() or 'phone' in flag.lower():
                target_tab = 12
                jarvis_message = f'voice call started with {name}'
            else:
                return "Please specify whether you want a video or voice call."
            
            encoded_message = urllib.parse.quote(message)
            whatsapp_url = f'whatsapp://send?phone={mobile_no}&text={encoded_message}'
            print(whatsapp_url)
            webbrowser.open(whatsapp_url)     
            time.sleep(4)
            
            for i in range(1,target_tab):
                pyautogui.hotkey('tab')
            
            print("ready to enter")
            pyautogui.hotkey('enter')
            return jarvis_message
        else : 
            return "Invalid flag specified (use 'message', 'video call', or 'voice call')"
            
    except Exception as e:
        return f"An error occurred: {str(e)}"

def get_whatsapp_chats(_=None):
    """Retrieves a list of recent WhatsApp chats."""
    try:
        response = requests.get("http://127.0.0.1:8081/api/chats", timeout=10)
        if response.status_code == 200:
            chats = response.json().get("chats", [])
            if not chats:
                return "No recent WhatsApp chats found."
            res = "Recent WhatsApp Chats:\n"
            for c in chats[:10]: # show top 10
                res += f"- {c['name']} (ID: {c['jid']})\n"
            return res
        else:
            return f"Failed to fetch chats: {response.text}"
    except Exception as e:
        return f"Error connecting to WhatsApp bridge: {e}"

def get_whatsapp_messages(contact_name_or_jid):
    """Retrieves recent messages for a specific contact or group."""
    try:
        # First, find the JID if a name was provided
        jid = contact_name_or_jid
        if "@" not in jid:
            chats_resp = requests.get("http://127.0.0.1:8081/api/chats", timeout=10)
            if chats_resp.status_code == 200:
                chats = chats_resp.json().get("chats", [])
                for c in chats:
                    if contact_name_or_jid.lower() in c['name'].lower():
                        jid = c['jid']
                        break
        
        response = requests.get(f"http://127.0.0.1:8081/api/messages?jid={jid}&limit=10", timeout=10)
        if response.status_code == 200:
            msgs = response.json().get("messages", [])
            if not msgs:
                return f"No messages found for {contact_name_or_jid}."
            res = f"Recent messages with {contact_name_or_jid}:\n"
            for m in msgs:
                sender = "You" if m['is_from_me'] else m['sender']
                content = m['content'] if m['content'] else f"[{m['media_type']}]"
                res += f"[{m['timestamp']}] {sender}: {content}\n"
            return res
        else:
            return f"Failed to fetch messages: {response.text}"
    except Exception as e:
        return f"Error connecting to WhatsApp bridge: {e}"

def send_whatsapp_media(input_str):
    """Sends a media file (image/video/doc) to a WhatsApp contact."""
    # format: recipient $ file_path $ caption
    parts = input_str.split('$')
    if len(parts) < 2:
        return "Invalid input. Use: recipient $ file_path $ caption(optional)"
    
    recipient = parts[0].strip()
    file_path = parts[1].strip()
    caption = parts[2].strip() if len(parts) > 2 else ""

    # Resolve number if name provided
    if not recipient.replace("+", "").isdigit() and "@" not in recipient:
        phone = get_contact_phone(recipient.lower())
        if phone:
            recipient = str(phone).replace(" ", "").replace("+", "")
            if len(recipient) == 10: recipient = "91" + recipient
        else:
            # Try searching in chats
            chats_resp = requests.get("http://127.0.0.1:8081/api/chats", timeout=10)
            if chats_resp.status_code == 200:
                for c in chats_resp.json().get("chats", []):
                    if recipient.lower() in c['name'].lower():
                        recipient = c['jid']
                        break

    try:
        payload = {
            "recipient": recipient,
            "message": caption,
            "media_path": file_path
        }
        response = requests.post("http://127.0.0.1:8081/api/send", json=payload, timeout=30)
        if response.status_code == 200:
            return f"Media sent successfully to {recipient}"
        else:
            return f"Failed to send media: {response.text}"
    except Exception as e:
        return f"Error connecting to WhatsApp bridge: {e}"


def add_contact_to_db(input_str: str) -> str:
    """Adds a new contact (name and phone) to the local contacts database."""
    # format: name $ phone
    try:
        parts = input_str.split('$')
        if len(parts) < 2:
            return "Invalid input. Use: name $ phone"
        
        name = parts[0].strip().lower()
        phone = parts[1].strip().replace(" ", "").replace("+", "")
        
        if len(phone) == 10:
            phone = "91" + phone

        conn = sqlite3.connect("contacts.db")
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO contacts (name, phone) VALUES (?, ?)", (name, phone))
            conn.commit()
            message = f"Contact '{name}' with number '{phone}' added successfully."
        except sqlite3.IntegrityError:
            message = f"Contact '{name}' already exists in the database."
        finally:
            conn.close()
        return message
    except Exception as e:
        return f"Error adding contact: {e}"


def open_file(input_str: str) -> str:
    result = get_path(input_str)
    if result is None:
        try:
            print("Searching for file path...")
            search_res = search_local_files(input_str)
            if "Found" in search_res:
                # Extract the first path from search results
                lines = search_res.split('\n')
                if len(lines) > 1:
                    first_path = lines[1].strip()
                    if os.path.exists(first_path):
                        result = Path(first_path)
                        print(f"Found path via search: {result}")
            
            if result is None:
                print("Falling back to GUI search")
                pyautogui.hotkey('win') 
                time.sleep(0.5)
                pyautogui.write(input_str, interval=0.02)
                time.sleep(0.2)
                pyautogui.press('enter')
                time.sleep(2)
                return f"Could not find exact path, triggered Windows search for: {input_str}"
        except Exception as e:
            return f"Failed to open '{input_str}' using fallback: {e}"

    try:
        # If result is a system command or URI string
        if isinstance(result, str):
            print("stage 1")
            subprocess.run(f"start {result}", shell=True, check=True)
            return f"Launched system app or command: {input_str}"

        # If result is a valid Path
        elif isinstance(result, Path):
            print("stage 2")
            if result.suffix == ".exe":
                print("stage 2.1")
                subprocess.Popen([str(result)])
                return f"Launched executable: {result}"
            else:
                print("stage 2.2")
                os.startfile(str(result))
                return f"Opened file: {result}"

    except Exception as e:
        # Log the failure and continue to fallback
        print(f"Primary open method failed: {e}")

    # Fallback: try launching through Windows Search using pyautogui
    
      
def close_file(file_name):
    # Try to find a window that matches the file/app name
    windows = [w for w in gw.getWindowsWithTitle(file_name) if w.isActive or w.isMaximized or w.isMinimized]
    
    if not windows:
        return f"No open window found with title including: {file_name}"
    
    try:
        win = windows[0]
        win.close()
        return f"Closed window: {file_name}"
    except Exception as e:
        return f"Error closing window: {e}"


def get_notification(input):
    seen_notifications = set()
    reader = easyocr.Reader(['en'])
    # Open the Action Center
    pyautogui.hotkey('win', 'n')
    time.sleep(1)  # Wait for the Action Center to open
    region=(1460, 535, 430, 292)
    img = pyautogui.screenshot(region=region)
    
    print("Captured notification image")
    image_np = np.array(img)
    result = reader.readtext(image_np)
    text =  ' '.join([res[1] for res in result])
    pyautogui.hotkey('win', 'n')
    if not text or text in seen_notifications or len(text) < 5:
        print("No new valid text detected.")
        time.sleep(5)
    seen_notifications.add(text)
    if 'no new notifications' in text.lower():
        return text
    else:
        pyautogui.hotkey('win', 'n')
        region = (1478, 28, 421, 780)
    img = pyautogui.screenshot(region=region)
    image_np = np.array(img)
    result = reader.readtext(image_np)
    text =  ' '.join([res[1] for res in result])
    pyautogui.hotkey('win', 'n')
    print("📢 Notification:", text)   
    return text


def get_weather_data(city: str) -> str:
  """
  This function fetches the current weather data for a given city
  """
  url = f'https://api.weatherstack.com/current?access_key=f5647a1087fd1756618efeff008ae8fa&query={city}'

  response = requests.get(url)

  return response.json()

def search_local_files(query: str) -> str:
    """Searches the entire PC for files in parallel across all drives and user folders."""
    import subprocess
    import string
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    query = query.strip()
    if not query:
        return "Please provide a file name or query to search for."
    
    search_pattern = "*" + "*".join(query.split()) + "*"
    
    # 1. Define all search locations
    priority_folders = [
        str(Path.home() / "Desktop"),
        str(Path.home() / "Documents"),
        str(Path.home() / "Downloads"),
        str(Path.home() / "Pictures"),
        str(Path.home() / "Videos"),
    ]
    # Use D:\ for root drives
    drives = [f"{d}:\\" for d in string.ascii_uppercase if os.path.exists(f"{d}:\\")]
    
    def search_task(target_path, is_drive=False):
        try:
            # Use where.exe directly with list arguments to avoid quoting hell
            cmd = ["where.exe", "/r", target_path, search_pattern]
            timeout = 90 if is_drive else 30
            
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            if proc.stdout:
                files = [f.strip() for f in proc.stdout.split('\n') if f.strip()]
                if is_drive:
                    files = [f for f in files if not any(x in f.lower() for x in ["node_modules", ".git", "appdata", "\\.next"])]
                return files
        except Exception:
            pass
        return []

    all_results = set() # Use a set to avoid duplicates
    print(f"[SEARCH] Starting parallel system-wide search for: {search_pattern}")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        # Submit priority folders
        futures = {executor.submit(search_task, f, False): f for f in priority_folders if os.path.exists(f)}
        # Submit all drives
        for d in drives:
            futures[executor.submit(search_task, d, True)] = d
            
        for future in as_completed(futures):
            res_list = future.result()
            if res_list:
                all_results.update(res_list)
            if len(all_results) >= 100: # Cap for safety
                break
                
    if not all_results:
        return f"No files found matching '{query}' across accessible drives ({', '.join(drives)})."
        
    # Sort results so priority folders (Desktop/Documents) appear first
    sorted_results = sorted(list(all_results), key=lambda x: (
        not any(p in x for p in priority_folders), # Priority folders first
        len(x) # Shorter paths first
    ))
    
    res = f"Found {len(sorted_results)} files matching '{query}':\n"
    for f in sorted_results[:30]:
        res += f"{f}\n"
    if len(sorted_results) > 30:
        res += f"\n... and {len(sorted_results) - 30} more results across your system."
        
    return res

def share_local_file(file_path: str) -> str:
    from telegram_bot import send_telegram_document
    file_path = file_path.strip()
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
        
    try:
        filename = os.path.basename(file_path)
        res = send_telegram_document(file_path, caption=f"Here is your file: {filename}")
        if res:
            return f"Successfully shared {filename} to Telegram."
        else:
            return f"Failed to share {filename} to Telegram. Ensure it's under 50MB and valid."
    except Exception as e:
        return f"Error sharing file: {e}"

def browser_control(input_str: str) -> str:
    """Controls the browser to perform actions like opening URLs, clicking, scrolling, and playing YouTube videos.
    Format: action $ url_or_query $ selector_or_text
    Actions: open, click, type, scroll, play_youtube
    """
    try:
        parts = input_str.split('$')
        action = parts[0].strip().lower()
        
        page = browser_manager.get_page()
        
        if action == "open":
            url = parts[1].strip()
            if not url.startswith("http"):
                url = "https://" + url
            page.goto(url)
            return f"Opened {url}"
            
        elif action == "click":
            target = parts[1].strip()
            # Try by text first, then by selector
            try:
                page.get_by_text(target, exact=False).first.click()
            except:
                page.click(target)
            return f"Clicked on {target}"
            
        elif action == "scroll":
            direction = parts[1].strip().lower()
            if direction == "down":
                page.evaluate("window.scrollBy(0, 500)")
            else:
                page.evaluate("window.scrollBy(0, -500)")
            return f"Scrolled {direction}"
            
        elif action == "play_youtube":
            query = parts[1].strip()
            search_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
            page.goto(search_url)
            
            # Click the first video
            # Wait for video results to load
            page.wait_for_selector("ytd-video-renderer")
            page.click("ytd-video-renderer #video-title")
            
            # Try to click play if it's paused
            time.sleep(2)
            try:
                page.click(".ytp-play-button")
            except:
                pass
                
            return f"Playing YouTube video for: {query}"
            
        elif action == "type":
            target = parts[1].strip()
            value = parts[2].strip()
            page.fill(target, value)
            return f"Typed {value} into {target}"
            
        else:
            return f"Unknown action: {action}"
            
    except Exception as e:
        return f"Browser Error: {e}"