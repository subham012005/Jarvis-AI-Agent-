# to use function from vocie_and_speak_ai and tool folder
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__) + "/.."))

# langchain's import 
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage,SystemMessage
from langgraph.checkpoint.memory import InMemorySaver

# functions and tools import
from main_and_prompt.jprompt import *
from jarvis_tool.tool import *

# to load environment variables
from dotenv import load_dotenv
load_dotenv()
    
# Initialize OpenAI model
model = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.7)

# Tools for agent imported from jarvis/tool/tool.py
tool = [
    search_tool, time_tool, open_files_tool, website_opener_tool, 
    get_application_path_tool, get_contact_number_tool, close_file_tool, 
    send_msg_calls_tool, get_notification_tool, search_local_files_tool, 
    share_file_tool, get_whatsapp_chats_tool, read_whatsapp_messages_tool, 
    send_whatsapp_media_tool, add_contact_tool, browser_control_tool
]

agent = create_agent(
    tools=tool,
    model=model,
    system_prompt=jarvis_original_prompt,
    store=InMemorySaver(),
    checkpointer=InMemorySaver()
)

from telegram_bot import send_telegram_message,fetch_telegram_messages
telegram_callback = None

def run_jarvis():
    last_update_id = -1
    send_telegram_message("Jarvis Server is now online and listening for commands!")
    print("Jarvis Server is now online and ready to assist you!")
    while(True):
        try:
            inp = fetch_telegram_messages(offset=last_update_id + 1)
            for update in inp:
                last_update_id = update['update_id']
                if "message" in update and "text" in update["message"]:
                    user_input = update["message"]["text"]
                    print(f"You: {user_input}")
                
                    if user_input.lower() == 'exit':
                        send_telegram_message("Jarvis signing off. Goodbye!")
                        return
                    else:
                        response_text = ""
                        try:
                            respo = agent.invoke(
                                {"messages": [{"role": "user", "content": user_input}]},
                                {"configurable": {"thread_id": 6115649410 }},
                            )
                            if "messages" in respo and len(respo["messages"]) > 0:
                                response_text = respo["messages"][-1].content
                            else:
                                response_text = "I'm sorry, I couldn't generate a response."
                        except Exception as e:
                            print(f"Error invoking agent: {e}")
                            response_text = f"Error invoking agent: {e}"
                        
                        send_telegram_message(response_text)
                        if telegram_callback:
                            telegram_callback(user_input, response_text)
        except Exception as e:
            print(f"Error in main loop: {e}")
            send_telegram_message(f"Error in main loop: {e}")

if __name__ == "__main__":
    run_jarvis()