from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from dotenv import load_dotenv
load_dotenv() 
@tool
def calculator(expression: str) -> str:
    """Calculate a simple math expression."""
    return str(eval(expression, {"__builtins__": {}}))

model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

agent = create_agent(
    model=model,
    tools=[calculator],
    system_prompt="You are a helpful reasoning agent. Use the calculator tool when math is needed."
)

result = agent.invoke({
    "messages": [
        {"role": "user", "content": "What is 25 * 13 + 7? Explain briefly."}
    ]
})

print(result["messages"][-1].content)