from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.audit_log import AuditLog
from app.tools.executor import ToolExecutor, AVAILABLE_TOOLS
from app.schemas.agent import ToolExecutionRecord

router = APIRouter(prefix="/tools", tags=["Tool Execution & Audit Trails"])

class ToolDirectExecuteRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any] = {}
    customer_id: Optional[str] = None
    ticket_id: Optional[str] = None

@router.get("")
async def list_tools():
    """Lists all available support tools with category, risk rating, and parameters."""
    return [
        {
            "name": tool.name,
            "description": tool.description,
            "category": tool.category.value,
            "risk_level": tool.risk_level.value,
            "requires_human_approval": tool.requires_human_approval
        }
        for tool in AVAILABLE_TOOLS.values()
    ]

@router.post("/execute", response_model=ToolExecutionRecord)
async def execute_tool_direct(req: ToolDirectExecuteRequest, db: AsyncSession = Depends(get_db)):
    """Executes a tool directly in testing/sandbox mode and writes audit trail."""
    record = await ToolExecutor.execute(
        tool_name=req.tool_name,
        params=req.parameters,
        db=db,
        ticket_id=req.ticket_id,
        customer_id=req.customer_id
    )
    return record

@router.get("/audit-logs")
async def get_audit_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Retrieves immutable audit trail of all automated actions performed."""
    stmt = select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return [
        {
            "id": log.id,
            "ticket_id": log.ticket_id,
            "customer_id": log.customer_id,
            "tool_name": log.tool_name,
            "tool_category": log.tool_category,
            "parameters": log.parameters,
            "execution_result": log.execution_result,
            "status": log.status,
            "risk_level": log.risk_level,
            "amount": log.amount,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]
