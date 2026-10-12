from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ToolExecutionRecord(BaseModel):
    tool_name: str
    tool_category: str # 'READ_ONLY', 'SAFE_WRITE', 'HIGH_RISK'
    parameters: Dict[str, Any] = {}
    result: Dict[str, Any] = {}
    status: str = "SUCCESS" # 'SUCCESS', 'FAILED', 'BLOCKED_REQUIRES_HUMAN'
    risk_level: str = "LOW"
    timestamp: Optional[datetime] = None

class AgentStepTrace(BaseModel):
    agent_name: str
    agent_role: str
    step_order: int
    status: str = "COMPLETED" # 'RUNNING', 'COMPLETED', 'ESCALATED', 'FAILED'
    thought_process: str
    input_data: Dict[str, Any] = {}
    output_data: Dict[str, Any] = {}
    tool_calls: List[Dict[str, Any]] = []
    latency_ms: int = 0
    confidence: float = 1.0

class TriageOutput(BaseModel):
    category: str # 'Billing & Payments', 'Technical Support', 'Account & Security', 'Subscription & Plans', 'General Inquiry'
    priority: str # 'Low', 'Medium', 'High', 'Urgent'
    urgency_level: str
    intent: str
    sentiment: str # 'Positive', 'Neutral', 'Frustrated', 'Angry'
    language: str = "en"
    key_entities: List[str] = []
    initial_assessment: str

class CustomerContextOutput(BaseModel):
    customer_profile: Dict[str, Any] = {}
    account_status: str
    subscription_details: Dict[str, Any] = {}
    relevant_invoices: List[Dict[str, Any]] = []
    past_ticket_history: List[Dict[str, Any]] = []
    context_summary: str

class KnowledgeRetrievalOutput(BaseModel):
    retrieved_articles: List[Dict[str, Any]] = []
    policies_applicable: List[str] = []
    authorized_actions: List[str] = []
    rag_context_text: str

class ResolutionOutput(BaseModel):
    ticket_status: str # 'Resolved', 'Requires More Information', 'Escalated'
    suggested_resolution: str
    step_by_step_guidance: List[str] = []
    recommended_actions: List[Dict[str, Any]] = []
    executed_tools: List[ToolExecutionRecord] = []
    draft_response: str
    requires_escalation: bool = False
    escalation_reason: Optional[str] = None

class EscalationOutput(BaseModel):
    is_escalated: bool
    escalation_level: str # 'None', 'L2_Technical', 'L2_Billing', 'Security_Ops', 'Executive_Support'
    escalation_reason: Optional[str] = None
    escalation_summary: Optional[str] = None
    assigned_team: Optional[str] = None
    urgency: str = "Medium"
    required_human_actions: List[str] = []

class ReviewerOutput(BaseModel):
    is_approved: bool
    quality_score: float # 0.0 to 1.0
    policy_compliance_check: str # 'PASS', 'FAIL', 'WARNING'
    hallucination_check: str # 'PASS', 'FAIL'
    safety_check: str # 'PASS', 'FAIL'
    reviewer_notes: str
    finalized_customer_response: str
    final_ticket_status: str
