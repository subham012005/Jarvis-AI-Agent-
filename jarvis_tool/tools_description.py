open_file_tool_description = (
    """Open any file or application on the system by name.
"""
)
close_file_tool_description = (
    """Open any file or application on the system by name.
"""
)


get_application_path_tool_description = ("take user query and check which software user taking about and get the path of that specific application or software.\n"
    "If user ask to open Brave brower or somthing else with two word then you have to understand what is main word : for example : user : brave browser , think : specifc name is brave , search for only brave."
)

website_opener_tool_description = ("""Opens a website given a URL in specific browser , first agent get the path of that specific browser and then open url in that browser.
    query in functionis given in this formate : www.example.com,brower_path,incognito_flag or www.example.com,software_name,incognito_flag
    incognito_flag should be 'true' if the user asks for incognito/private mode, otherwise 'false'.
    If someone ask for opening in private window that means open specific link in incognito window""")

search_tool_description = ("Searches the internet for information using Google. The input should be a query string, and the tool will return search results based on that query.")

time_tool_description = ("Returns the current date and time in a human-readable format. No input is required for this tool.")

get_contact_phone_description = ("Retrieves the phone number of a contact from the user's address book. The input should be the name of the contact, and the tool will return the associated phone number if found. If the contact is not found, it will return an None message.and try different spellings of same name , like:shubham , subham")

send_msg_calls_tool_description = ("""Use to make call or send message to a number.It required 4 input. The input should be in this formate : mobile_no $ message (if any) $ flag (what to do) $ name(name of the person whome to send message):\n
mobile_no. : use get get_contact_number_tool to get number of that person
message : what user ask to send for If there is no message then " ", example : Hello, How are you ? .  
flag : what user ask to do like : message , video call , phone call
name : name of that person user want to contact
The above formate must be strictly followed
output : mobile_no$message$flag$name
""")

get_notification_tool_description = ("""Captures the latest notification from the Windows Action Center and extracts text from it using OCR. The tool will return the text of the notification if successfully captured and recognized. If no valid text is detected, it will return an appropriate message.""")

get_weather_tool_description = ("""This function fetches the current weather data for a given city""")

search_local_files_tool_description = ("""Searches the user's computer for local files (documents, photos, etc.) matching a specific file name or extension. Input should be the file name or partial name to search for (e.g., 'resume.pdf' or 'vacation photo'). Returns a list of found file paths.""")

share_file_tool_description = ("""Shares a local file with the user by uploading it to Telegram. Input should be the absolute file path obtained from the search_local_files_tool. Do not try to share a file without finding its absolute path first.""")

get_whatsapp_chats_description = ("""Retrieves a list of recent WhatsApp conversations/chats.""")

get_whatsapp_messages_description = ("""Reads messages from a specific WhatsApp chat.""")

send_whatsapp_media_description = ("""Sends a media file (document, image, or video) to a WhatsApp contact. 
    Format: recipient $ absolute_file_path $ caption. 
    Recipient can be a contact name or phone number.
    Always use Search_Local_Files_Tool first to get the absolute path if you don't have it.""")

add_contact_tool_description = ("""Adds a new contact to the Jarvis local database. Input format: Name $ Phone Number.""")

browser_control_tool_description = ("""Controls a browser instance to automate web tasks. 
Format: action $ target_or_url $ value_or_selector
Actions:
- open: Opens a URL. Target is the URL.
- click: Clicks an element. Target is text or CSS selector.
- scroll: Scrolls page. Target is 'up' or 'down'.
- play_youtube: Searches and plays a video. Target is the search query.
- type: Types into a field. Target is CSS selector, Value is the text.
Example: play_youtube $ lo-fi hip hop
""")
