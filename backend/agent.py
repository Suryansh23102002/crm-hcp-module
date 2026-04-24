import os
from typing import Annotated, TypedDict
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage

# Ensure environment variables are loaded
load_dotenv()

class State(TypedDict):
    messages: Annotated[list, add_messages]
    form_data: dict
    model_name: str 

@tool
def log_interaction(
    hcp_name: str = "", 
    interaction_type: str = "Meeting", 
    sentiment: str = "", 
    topics_discussed: str = "",     
    materials_shared: str = "",     
    attendees: str = "",            
    samples_distributed: str = "",  
    date: str = "", 
    time: str = ""
):
    """
    Use this tool to log a new interaction with an HCP. 
    IMPORTANT: You must map the extracted data exactly to these parameter names:
    - hcp_name
    - interaction_type
    - sentiment
    - topics_discussed (DO NOT use 'topics')
    - materials_shared
    - attendees
    - samples_distributed
    """
    return {
        "action": "UPDATE_FORM",
        "data": {
            "hcp_name": hcp_name, 
            "interaction_type": interaction_type,
            "sentiment": sentiment, 
            "topics_discussed": topics_discussed,
            "materials_shared": materials_shared, 
            "attendees": attendees,                     
            "samples_distributed": samples_distributed, 
            "date": date, 
            "time": time
        }
    }

@tool
def edit_interaction(field_to_update: str, new_value: str):
    """Use this tool to edit a specific field in the form if the user corrects you."""
    return {"action": "EDIT_FORM", "field": field_to_update, "value": new_value}

@tool
def fetch_hcp_history(hcp_name: str):
    """Fetch past history for an HCP."""
    return f"Retrieved history for {hcp_name}."

@tool
def schedule_follow_up(date: str, time: str):
    """Schedule a follow-up meeting."""
    return f"Scheduled follow-up for {date} at {time}."

@tool
def log_sample_distribution(sample_name: str, quantity: int):
    """Log the distribution of product samples."""
    return f"Logged {quantity} samples of {sample_name}."

tools = [log_interaction, edit_interaction, fetch_hcp_history, schedule_follow_up, log_sample_distribution]

def chatbot(state: State):
    api_key = os.environ.get("GROQ_API_KEY")
    selected_model = state.get("model_name", "llama-3.3-70b-versatile")
    
    llm = ChatGroq(model=selected_model, api_key=api_key, temperature=0)
    llm_with_tools = llm.bind_tools(tools)
    
    # Force the AI to act as a data extractor, not a chatbot
    messages = state["messages"]
    system_prompt = SystemMessage(content="You are an AI CRM assistant. You MUST use the 'log_interaction' tool to extract and save data whenever the user describes a meeting or interaction. Never just reply with text if interaction data is present in the prompt.")
    
    # Ensure system message is injected at the start of the conversation
    if not messages or messages[0].type != "system":
        messages = [system_prompt] + messages
        
    return {"messages": [llm_with_tools.invoke(messages)]}

def tool_executor(state: State):
    last_message = state["messages"][-1]
    form_updates = state.get("form_data", {}).copy() 
    
    if hasattr(last_message, 'tool_calls'):
        for tool_call in last_message.tool_calls:
            if tool_call["name"] == "log_interaction":
                form_updates.update(tool_call["args"])
            elif tool_call["name"] == "edit_interaction":
                field = tool_call["args"].get("field_to_update")
                val = tool_call["args"].get("new_value")
                if field in form_updates:
                    form_updates[field] = val
                
    return {"form_data": form_updates}

graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("tools", tool_executor)
graph_builder.add_edge(START, "chatbot")

def should_continue(state: State):
    last_message = state["messages"][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return END

graph_builder.add_conditional_edges("chatbot", should_continue)
graph_builder.add_edge("tools", END)

app_graph = graph_builder.compile()