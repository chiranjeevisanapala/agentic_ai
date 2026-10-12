from typing import Dict, Any, Callable, Optional, List
from pydantic import BaseModel
import enum

class ToolCategory(str, enum.Enum):
    READ_ONLY = "READ_ONLY"         # Safe queries, customer info, invoice lookups
    SAFE_WRITE = "SAFE_WRITE"       # Auto-approved actions (Refund <= $100, Resend invoice, Reset MFA link)
    HIGH_RISK = "HIGH_RISK"         # Needs Human Escalation (Refund > $100, Permanent account delete, Chargeback override)

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ToolDefinition(BaseModel):
    name: str
    description: str
    category: ToolCategory
    risk_level: RiskLevel
    requires_human_approval: bool = False
    parameters_schema: Dict[str, Any] = {}
