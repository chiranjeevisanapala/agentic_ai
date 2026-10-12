from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime

class MultiAgentWorkflowState(TypedDict, total=False):
    # Input
    ticket_id: Optional[str]
    ticket_number: str
    customer_id: Optional[str]
    customer_query: str
    conversation_history: List[Dict[str, str]]
    
    # Triage Agent Output
    issue_category: str
    priority: str
    urgency_level: str
    sentiment: str
    intent: str
    triage_notes: str
    
    # Customer Context Agent Output
    customer_profile: Dict[str, Any]
    account_status: str
    subscription_details: Dict[str, Any]
    billing_invoices: List[Dict[str, Any]]
    past_ticket_count: int
    context_summary: str
    
    # Knowledge Retrieval Agent Output
    retrieved_knowledge: List[Dict[str, Any]]
    applicable_policies: List[str]
    authorized_actions: List[str]
    rag_context: str
    
    # Resolution Agent Output
    suggested_resolution: str
    step_by_step_guidance: List[str]
    recommended_actions: List[Dict[str, Any]]
    actions_performed: List[Dict[str, Any]]
    draft_response: str
    resolution_status: str # 'Resolved', 'Requires More Information', 'Escalated'
    
    # Escalation Agent Output
    is_escalated: bool
    escalation_reason: Optional[str]
    escalation_summary: Optional[str]
    assigned_team: Optional[str]
    escalation_urgency: str
    required_human_actions: List[str]
    
    # Reviewer Agent Output
    reviewer_approved: bool
    quality_score: float
    policy_compliance: str
    hallucination_check: str
    safety_check: str
    reviewer_notes: str
    final_response: str
    final_status: str
    
    # Execution Tracking
    step_traces: List[Dict[str, Any]]
    total_latency_ms: int
