import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Integer, Float
from sqlalchemy.orm import relationship
from app.database import Base

class AgentTrace(Base):
    __tablename__ = "agent_traces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    
    agent_name = Column(String(100), nullable=False) # Triage Agent, Customer Context Agent, Knowledge Retrieval Agent, Resolution Agent, Escalation Agent, Reviewer Agent
    agent_role = Column(String(100), nullable=False)
    step_order = Column(Integer, default=1)
    
    status = Column(String(50), default="COMPLETED") # RUNNING, COMPLETED, SKIPPED, ESCALATED, FAILED
    latency_ms = Column(Integer, default=0)
    
    # Detailed Trace payload
    thought_process = Column(Text, nullable=True)
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    tool_calls = Column(JSON, default=list)
    confidence = Column(Float, default=1.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="traces")
