import os
import asyncio
import traceback
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_mcp_adapters.tools import load_mcp_tools
from mcp import StdioServerParameters, ClientSession
from mcp.client.stdio import stdio_client
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage

async def run_whatsapp_agent():
    # 1. Configuration
    # Set your API keys here or in environment variables
    openai_api_key = os.environ.get("OPENAI_API_KEY", "")
    
    # 2. Define the MCP Server parameters
    server_params = StdioServerParameters(
        command="python",
        args=[os.path.join(os.path.dirname(__file__), "main.py")],
    )

    print("Connecting to WhatsApp MCP Server...")
    
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                # Initialize the MCP session
                await session.initialize()
                
                # 3. Load tools from the MCP session
                tools = await load_mcp_tools(session)
                print(f"Successfully loaded {len(tools)} tools from WhatsApp MCP.")
                
                # 4. Initialize the LLM (OpenAI)
                model = ChatOpenAI(model="gpt-4o", openai_api_key=openai_api_key)
                
                # 5. Create the Agent
                system_message = (
                    "You are a helpful WhatsApp Assistant. You can search contacts, read messages, "
                    "and send messages or files. Always be polite and concise. "
                    "When asked to send a message to a phone number, ensure it includes the country code (e.g., 91 for India). "
                    "If the user provides a 10-digit number without a country code, ask for it or try prepending '91' if appropriate for their region. "
                    "Always search for a contact by name first if you don't have their JID."
                )
                
                agent = create_react_agent(model, tools, prompt=system_message)
                
                print("\n--- WhatsApp AI Agent Ready ---")
                print("You can now ask the agent to do things like:")
                print("- 'Search for a contact named John'")
                print("- 'List my recent chats'")
                print("- 'Send a message to 919876543210 saying Hello!'")
                print("Type 'exit' to quit.")
                print("-------------------------------\n")
                
                # 6. Interactive Loop
                while True:
                    # Use to_thread to keep input from blocking the event loop
                    user_input = await asyncio.to_thread(input, "You: ")
                    
                    if user_input.lower() in ["exit", "quit", "bye"]:
                        break
                    
                    if not user_input.strip():
                        continue

                    print("Agent is thinking...")
                    
                    try:
                        # Run the agent
                        inputs = {"messages": [HumanMessage(content=user_input)]}
                        async for event in agent.astream(inputs, stream_mode="values"):
                            if "messages" in event:
                                msg = event["messages"][-1]
                                content = msg.content
                                if isinstance(content, list):
                                    # Extract text from content blocks
                                    content = "\n".join([block.get("text", "") for block in content if isinstance(block, dict) and block.get("type") == "text"])
                                final_answer = content

                        if final_answer:
                            print(f"\nAgent: {final_answer}")
                    except Exception as agent_err:
                        print(f"Error during agent execution: {agent_err}")
                        traceback.print_exc()

    except Exception as e:
        print(f"Connection or session error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    try:
        asyncio.run(run_whatsapp_agent())
    except KeyboardInterrupt:
        print("\nExiting...")
