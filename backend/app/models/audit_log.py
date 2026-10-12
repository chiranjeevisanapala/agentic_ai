import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, Float
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), index=True, nullable=True)
    customer_id = Column(String(36), index=True, nullable=True)
    
    tool_name = Column(String(100), nullable=False) # e.g. issue_refund, apply_credit, reset_mfa
    tool_category = Column(String(50), default="SAFE_WRITE") # READ_ONLY, SAFE_WRITE, HIGH_RISK
    parameters = Column(JSON, default=dict)
    execution_result = Column(JSON, default=dict)
    status = Column(String(50), default="SUCCESS") # SUCCESS, FAILED, ESCALATED_WITHOUT_EXECUTION
    
    executed_by_agent = Column(String(100), default="Resolution Agent")
    approved_by_reviewer = Column(String(20), default="Yes")
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH
    amount = Column(Float, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
