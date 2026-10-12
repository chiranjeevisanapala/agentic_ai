from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.agent import AgentStepTrace, ToolExecutionRecord

class TicketMessageCreate(BaseModel):
    content: str
    sender_type: str = "customer" # 'customer', 'human_agent'
    sender_name: Optional[str] = "Customer"

class TicketMessageResponse(BaseModel):
    id: str
    ticket_id: str
    sender_type: str
    sender_name: str
    content: str
    metadata_json: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_code: Optional[str] = None
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    customer_query: str
    channel: str = "web_portal"

class TicketResolutionRequest(BaseModel):
    ticket_id: Optional[str] = None
    customer_id: Optional[str] = None
    customer_query: str
    conversation_history: List[Dict[str, str]] = []

class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    customer_id: str
    customer_query: str
    issue_category: str
    priority: str
    status: str
    suggested_resolution: Optional[str] = None
    final_response: Optional[str] = None
    retrieved_knowledge: List[Dict[str, Any]] = []
    recommended_actions: List[Dict[str, Any]] = []
    actions_performed: List[Dict[str, Any]] = []
    escalation_status: str
    escalation_reason: Optional[str] = None
    escalation_summary: Optional[str] = None
    assigned_human_agent: Optional[str] = None
    reviewer_approved: str
    reviewer_notes: Optional[str] = None
    confidence_score: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TicketDetailResponse(TicketResponse):
    customer: Optional[Dict[str, Any]] = None
    messages: List[TicketMessageResponse] = []
    agent_traces: List[AgentStepTrace] = []

class ResolutionResult(BaseModel):
    ticket_id: str
    ticket_number: str
    ticket_status: str # 'Resolved' / 'Requires More Information' / 'Escalated'
    customer_query: str
    issue_category: str
    priority: str
    retrieved_knowledge: List[Dict[str, Any]]
    suggested_resolution: str
    recommended_actions: List[Dict[str, Any]]
    actions_performed: List[Dict[str, Any]]
    escalation_status: str
    escalation_reason: Optional[str] = None
    escalation_summary: Optional[str] = None
    agent_execution_history: List[AgentStepTrace]
    final_response: str
    confidence_score: float
    reviewer_verdict: Dict[str, Any]
