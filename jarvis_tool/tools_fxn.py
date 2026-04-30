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

# Common install locations to search user apps (add/remove paths as per your system)
COMMON_PATHS = [
    Path(os.environ.get("ProgramFiles", "C:\\Program Files")),
    Path(os.environ.get("ProgramFiles(x86)", "C:\\Program Files (x86)")),
    Path(os.environ.get("LOCALAPPDATA", "")),
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
        url, browser_path = input_data.split(',')
        if ('.exe' not in browser_path):
            browser_path = get_path(browser_path)
        else:
        # Clean up whitespace
            browser_path = browser_path.strip()

        url = url.strip()
            
        # Escape backslashes or use raw string
        browser_path = browser_path.replace("\\", "\\\\")
        
        # Register the browser
        webbrowser.get(browser_path+" %s").open(url)
        
        return f"Website '{url}' has been opened in your specified browser."
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
    mobile_no,message,flag,name = string[0].strip(), string[1].strip(), string[2].strip(), string[3].strip()
    # convert +91 78144 87078 to +917814487078
    mobile_no = mobile_no.replace(" ", "").replace("+91", "+91")
    #check if mobile_no. is number or not
    print(f"mobile_no : {mobile_no} , message : {message} , flag : {flag} , name : {name}")
    
    if not mobile_no.isdigit():
        if get_contact_phone(name.lower()) is not None:
            mobile_no = get_contact_phone(name.lower())
        elif get_contact_phone(mobile_no.lower()) is not None:
            mobile_no = get_contact_phone(mobile_no.lower())
        else:
            return "Please provide a valid mobile number."
    
    
    try:
        if flag.lower() == 'message':
            target_tab = 2
            jarvis_message = f'message send sucessfully to {name}'
        
        elif 'call' in flag.lower() :
            if 'video' in flag.lower():
                target_tab = 11
                jarvis_message = f'video call started with {name}'
            elif 'voice' in flag.lower() or 'phone' in flag.lower():
                target_tab = 12
                jarvis_message = f'voice call started with {name}'
            else:
                return "Please specify whether you want a video or voice call."
        else : 
            return "Some error occured"
        
        
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
    except:
        return jarvis_message


def open_file(input_str: str) -> str:
    result = get_path(input_str)
    print(f"Result from get_path: {result}")
    if result is None:
        try:
            print("stage 3")
            pyautogui.hotkey('win') 
            time.sleep(0.5)
            pyautogui.write(input_str, interval=0.02)
            time.sleep(0.2)
            pyautogui.press('enter')
            time.sleep(2)
            return f"Don't Get any direct path so i try search function {input_str} and open first result"
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