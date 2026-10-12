import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    customer_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. CUST-10492
    name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    company = Column(String(255), nullable=True)
    subscription_tier = Column(String(50), default="Pro") # Free, Pro, Enterprise
    subscription_status = Column(String(50), default="active") # active, past_due, trialing, cancelled
    monthly_rate = Column(Float, default=49.0)
    current_balance = Column(Float, default=0.0)
    renewal_date = Column(DateTime, nullable=True)
    payment_method = Column(String(100), default="Visa ending in 4242")
    mfa_enabled = Column(String(20), default="Enabled (TOTP)")
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    tickets = relationship("Ticket", back_populates="customer", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="customer", cascade="all, delete-orphan")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. INV-2025-001
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="paid") # paid, duplicate_charge, pending, refunded, disputed
    description = Column(String(255), nullable=False)
    billing_date = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    pdf_url = Column(String(255), nullable=True)

    customer = relationship("Customer", back_populates="invoices")
