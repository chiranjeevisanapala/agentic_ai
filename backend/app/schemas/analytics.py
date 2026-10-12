from typing import Dict, Any, List
from pydantic import BaseModel

class AnalyticsOverview(BaseModel):
    total_tickets: int
    resolved_count: int
    more_info_count: int
    escalated_count: int
    pending_count: int
    auto_resolution_rate: float
    escalation_rate: float
    avg_latency_ms: float
    category_distribution: Dict[str, int]
    priority_distribution: Dict[str, int]
    agent_performance: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
