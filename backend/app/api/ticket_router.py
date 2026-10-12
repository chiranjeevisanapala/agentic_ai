from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.ticket import Ticket, TicketMessage, TicketStatus
from app.models.customer import Customer
from app.models.agent_trace import AgentTrace
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketDetailResponse,
    TicketResolutionRequest,
    ResolutionResult
)
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/tickets", tags=["Tickets & Multi-Agent Resolution"])

@router.post("/resolve", response_model=ResolutionResult)
async def resolve_ticket(req: TicketResolutionRequest, db: AsyncSession = Depends(get_db)):
    """
    Executes the full 6-agent resolution workflow on a customer query:
    1. Triage Agent (Classification & Urgency)
    2. Customer Context Agent (Account & Invoices)
    3. Knowledge Retrieval Agent (Vector RAG)
    4. Resolution Agent (Step-by-step guidance & safe tool execution)
    5. Escalation Agent (Risk mitigation & human escalation packet)
    6. Reviewer Agent (Quality assurance & final response sign-off)
    """
    result = await orchestrator.execute_workflow(
        customer_query=req.customer_query,
        customer_id=req.customer_id,
        ticket_id=req.ticket_id,
        conversation_history=req.conversation_history,
        db=db
    )
    return result

@router.get("", response_model=List[TicketResponse])
async def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Ticket).order_by(desc(Ticket.created_at)).limit(limit)
    if status_filter:
        stmt = stmt.where(Ticket.status == status_filter)
    if category_filter:
        stmt = stmt.where(Ticket.issue_category == category_filter)
    
    res = await db.execute(stmt)
    tickets = res.scalars().all()
    return [TicketResponse.model_validate(t) for t in tickets]

@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket_detail(ticket_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Ticket).where(Ticket.id == ticket_id).options(
        selectinload(Ticket.messages),
        selectinload(Ticket.traces),
        selectinload(Ticket.customer)
    )
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    customer_dict = None
    if ticket.customer:
        customer_dict = {
            "id": ticket.customer.id,
            "customer_code": ticket.customer.customer_code,
            "name": ticket.customer.name,
            "email": ticket.customer.email,
            "subscription_tier": ticket.customer.subscription_tier,
            "subscription_status": ticket.customer.subscription_status,
            "monthly_rate": ticket.customer.monthly_rate,
            "payment_method": ticket.customer.payment_method
        }

    return TicketDetailResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        customer_id=ticket.customer_id,
        customer_query=ticket.customer_query,
        issue_category=ticket.issue_category,
        priority=ticket.priority,
        status=ticket.status,
        suggested_resolution=ticket.suggested_resolution,
        final_response=ticket.final_response,
        retrieved_knowledge=ticket.retrieved_knowledge or [],
        recommended_actions=ticket.recommended_actions or [],
        actions_performed=ticket.actions_performed or [],
        escalation_status=ticket.escalation_status,
        escalation_reason=ticket.escalation_reason,
        escalation_summary=ticket.escalation_summary,
        assigned_human_agent=ticket.assigned_human_agent,
        reviewer_approved=ticket.reviewer_approved,
        reviewer_notes=ticket.reviewer_notes,
        confidence_score=ticket.confidence_score,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        customer=customer_dict,
        messages=ticket.messages or [],
        agent_traces=ticket.traces or []
    )

@router.patch("/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: str,
    new_status: str = Query(..., enum=["Resolved", "Requires More Information", "Escalated", "Pending Review", "Open"]),
    assigned_agent: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Ticket).where(Ticket.id == ticket_id)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = new_status
    if assigned_agent:
        ticket.assigned_human_agent = assigned_agent
    if new_status == "Escalated":
        ticket.escalation_status = "Escalated to Human Specialist"
    
    await db.commit()
    return {"message": "Status updated successfully", "ticket_id": ticket.id, "status": ticket.status}
