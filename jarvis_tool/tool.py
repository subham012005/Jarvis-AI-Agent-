
from jarvis_tool.tools_description import get_weather_tool_description
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__) + "/.."))

from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain.tools import tool
from jarvis_tool.tools_fxn import *
from jarvis_tool.tools_description import *
from dotenv import load_dotenv
load_dotenv()
# search internet for information
search_wrapper = GoogleSerperAPIWrapper()


@tool("Website_Opener_Tool",description=website_opener_tool_description)
def website_opener_tool(input_data: str) -> str:
    return open_website(input_data)
    
@tool("Google_Search",description=search_tool_description)
def search_tool(input_data: str) -> str:
    return search_wrapper.run(input_data)

@tool("Date_and_time_tool",description=time_tool_description)
def time_tool(input_data: str) -> str:
    return get_current_time()

@tool("File_Opening_Tool",description= open_file_tool_description)
def open_files_tool(input_data: str) -> str:
    return open_file(input_data)

@tool("File_Closing_Tool",description= close_file_tool_description)
def close_file_tool(input_data: str) -> str:
    return close_file(input_data)

@tool("Get_Path_Tool",description=get_application_path_tool_description)
def get_application_path_tool(input_data: str) -> str:
    return get_path(input_data)

@tool("Get_Contact_Number",description= get_contact_phone_description)
def get_contact_number_tool(input_data: str) -> str:    
    return get_contact_phone(input_data)

@tool("Message_and_calls_Maker",description= send_msg_calls_tool_description)
def send_msg_calls_tool(input_data: str) -> str:    
    return message_call_whatsapp(input_data)

@tool("Get_Notification",description = get_notification_tool_description)
def get_notification_tool(input_data: str) -> str:    
    return get_notification(input_data)


@tool("Get_weather_tool",description = get_weather_tool_description)
def get_weather_data_tool(input_data : str) -> str:
  return get_weather_data(input_data)



# # Tool definition
# website_opener_tool = Tool.from_function(
#     name="Website Opener Tool",
#     func=open_website,
#     description=website_opener_tool_description
# )

# # search Tool
# search_tool = Tool.from_function(
#     func=search_wrapper.run,
#     name="Google Search",
#     description=search_tool_description
# )

# # time tool
# time_tool = Tool.from_function(
#     func=get_current_time,
#     name="Date and time tool",
#     description=time_tool_description
# )

# # File opening 
# open_files_tool = Tool.from_function(
#     func=open_file,
#     name="File Opening Tool",
#     description= open_file_tool_description
# )

# # File closing
# close_file_tool = Tool.from_function(
#     func=close_file,
#     name="File Closing Tool",
#     description= close_file_tool_description
# )

# get_application_path_tool = Tool.from_function(
#     func=get_path,
#     name = "Get Path Tool",
#     description=get_application_path_tool_description
# )

# get_contact_number_tool = Tool.from_function(
#     func = get_contact_phone,
#     name = "Get Contact Number",
#     description= get_contact_phone_description
# )

# send_msg_calls_tool = Tool.from_function(
#     func = message_call_whatsapp,
#     name = "Message and calls Maker",
#     description= send_msg_calls_tool_description
# )

# get_notification_tool = Tool.from_function(
#     func = get_notification,
#     name = "Get Notification",
#     description = get_notification_tool_description
# )