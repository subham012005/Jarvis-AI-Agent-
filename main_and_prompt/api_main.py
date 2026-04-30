from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sys
import os

# Add parent path to sys
sys.path.append(os.path.abspath(os.path.dirname(__file__) + "/.."))

# Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import initialize_agent, AgentType
from langchain_core.messages import SystemMessage
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
from main_and_prompt.jprompt import *
from jarvis_tool.tool import *

# Load env
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize model and tools
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
tools = [search_tool, time_tool, website_opener_tool,
         get_application_path_tool, get_contact_number_tool
         ]

# Memory setup
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
memory.chat_memory.messages.append(SystemMessage(content=jnews))

# Agent setup
agent = initialize_agent(
    tools=tools,
    llm=model,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True
)

# Pydantic request model
class Query(BaseModel):
    query: str

@app.get("/")
def greet():
    return {"Status":"this api is live now"}

# POST endpoint to interact with Jarvis
@app.get("/ask")
async def ask_jarvis_get(query: str):
    try:
        if query.lower() == "exit":
            return {"output": "Shutting down Jarvis..."}
        
        response = agent.invoke(query)
        return {"output": response["output"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

