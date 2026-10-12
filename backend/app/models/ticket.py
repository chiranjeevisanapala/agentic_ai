import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class TicketStatus(str, enum.Enum):
    RESOLVED = "Resolved"
    REQUIRES_MORE_INFO = "Requires More Information"
    ESCALATED = "Escalated"
    PENDING_REVIEW = "Pending Review"
    OPEN = "Open"

class TicketPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class TicketCategory(str, enum.Enum):
    BILLING = "Billing & Payments"
    TECHNICAL = "Technical Support"
    ACCOUNT = "Account & Security"
    SUBSCRIPTION = "Subscription & Plans"
    GENERAL = "General Inquiry"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. TCK-8942
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    
    # Core Fields required by prompt
    customer_query = Column(Text, nullable=False)
    issue_category = Column(String(100), default=TicketCategory.GENERAL.value)
    priority = Column(String(50), default=TicketPriority.MEDIUM.value)
    status = Column(String(50), default=TicketStatus.OPEN.value)
    
    # Resolution details
    suggested_resolution = Column(Text, nullable=True)
    final_response = Column(Text, nullable=True)
    
    # Knowledge retrieved snippets & customer context snapshot
    retrieved_knowledge = Column(JSON, default=list) # List of articles / chunks
    customer_context_snapshot = Column(JSON, default=dict)
    
    # Actions performed (tool calls) vs recommended actions
    recommended_actions = Column(JSON, default=list)
    actions_performed = Column(JSON, default=list)
    
    # Escalation tracking
    escalation_status = Column(String(50), default="None") # None, Pending Human Review, Escalated to L2 Billing, etc.
    escalation_reason = Column(Text, nullable=True)
    escalation_summary = Column(Text, nullable=True)
    assigned_human_agent = Column(String(255), nullable=True)
    
    # Reviewer / Quality verdict
    reviewer_approved = Column(String(20), default="Approved")
    reviewer_notes = Column(Text, nullable=True)
    confidence_score = Column(String(20), default="0.95")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="tickets")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketMessage.created_at")
    traces = relationship("AgentTrace", back_populates="ticket", cascade="all, delete-orphan", order_by="AgentTrace.step_order")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False)
    sender_type = Column(String(50), nullable=False) # 'customer', 'agent_system', 'human_agent', 'system_event'
    sender_name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict) # Can store tool invocation badges, UI payloads
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="messages")
