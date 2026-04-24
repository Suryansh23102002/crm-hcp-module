from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage
from agent import app_graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    current_form_data: dict
    model_name: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        initial_state = {
            "messages": [HumanMessage(content=req.message)],
            "form_data": req.current_form_data,
            "model_name": req.model_name
        }
        
        result = app_graph.invoke(initial_state)
        last_message = result["messages"][-1]
        
        # Check if the AI actually used the tool
        tool_was_used = hasattr(last_message, 'tool_calls') and len(last_message.tool_calls) > 0
        
        if tool_was_used:
            ai_response = "I have updated the form based on your input. Please review the details."
        else:
            ai_response = last_message.content
        
        return {
            "reply": ai_response,
            "form_data": result.get("form_data", req.current_form_data),
            "tool_used": tool_was_used 
        }
        
    except Exception as e:
        print(f"\n[SERVER ERROR]: {str(e)}\n")
        return {
            "reply": f"Error: {str(e)}",
            "form_data": req.current_form_data,
            "tool_used": False
        }