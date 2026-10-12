from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    amount: float
    currency: str
    status: str
    description: str
    billing_date: datetime
    paid_at: Optional[datetime] = None
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True

class CustomerResponse(BaseModel):
    id: str
    customer_code: str
    name: str
    email: str
    company: Optional[str] = None
    subscription_tier: str
    subscription_status: str
    monthly_rate: float
    current_balance: float
    renewal_date: Optional[datetime] = None
    payment_method: str
    mfa_enabled: str
    metadata_json: Dict[str, Any] = {}
    created_at: datetime
    invoices: List[InvoiceResponse] = []

    class Config:
        from_attributes = True

class CustomerContext(BaseModel):
    customer_id: str
    customer_code: str
    name: str
    email: str
    subscription_tier: str
    subscription_status: str
    monthly_rate: float
    current_balance: float
    payment_method: str
    mfa_enabled: str
    recent_invoices: List[Dict[str, Any]] = []
    past_ticket_count: int = 0
    recent_tickets_summary: List[Dict[str, Any]] = []
    account_flags: List[str] = []
