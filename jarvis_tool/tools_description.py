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
    query in functionis given in this formate : www.example.com,brower_path or www.example.com,software_name
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