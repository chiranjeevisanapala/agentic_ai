import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from app.database import Base

class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    article_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. KB-BILL-001
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Billing, Technical, Policies, SLA, Security
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
    policy_reference = Column(String(100), nullable=True)
    action_permissions = Column(JSON, default=list) # e.g. ["issue_refund", "apply_credit"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
