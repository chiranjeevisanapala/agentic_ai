import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.memory import memory_manager
from app.agents.orchestrator import orchestrator
from app.schemas.ticket import ResolutionResult

router = APIRouter(prefix="/chat", tags=["Live Chat & Memory"])

class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    customer_id: Optional[str] = None
    message: str

class ChatMessageResponse(BaseModel):
    session_id: str
    reply: str
    resolution_data: ResolutionResult
    history: List[Dict[str, Any]]

@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(req: ChatMessageRequest, db: AsyncSession = Depends(get_db)):
    session_id = req.session_id or f"sess_{uuid.uuid4().hex[:12]}"
    
    # 1. Fetch previous history from memory
    history = await memory_manager.get_history(session_id, limit=8)
    formatted_history = [
        {"role": h.get("role", "customer"), "content": h.get("content", "")}
        for h in history
    ]

    # 2. Add current customer message to memory
    await memory_manager.add_message(session_id, role="customer", content=req.message)

    # 3. Trigger multi-agent resolution workflow
    result = await orchestrator.execute_workflow(
        customer_query=req.message,
        customer_id=req.customer_id,
        conversation_history=formatted_history,
        db=db
    )

    # 4. Save assistant response to memory
    await memory_manager.add_message(
        session_id,
        role="assistant",
        content=result.final_response,
        metadata={
            "ticket_id": result.ticket_id,
            "status": result.ticket_status,
            "actions_performed": result.actions_performed
        }
    )

    # 5. Return updated history
    updated_history = await memory_manager.get_history(session_id, limit=10)

    return ChatMessageResponse(
        session_id=session_id,
        reply=result.final_response,
        resolution_data=result,
        history=updated_history
    )

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    history = await memory_manager.get_history(session_id, limit=20)
    return {"session_id": session_id, "messages": history}

@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str):
    await memory_manager.clear_history(session_id)
    return {"message": f"Cleared session {session_id}"}
