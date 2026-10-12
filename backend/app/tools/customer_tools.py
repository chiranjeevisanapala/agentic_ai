from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.customer import Customer, Invoice
from app.models.ticket import Ticket

async def tool_get_customer_account(customer_code_or_email: str, db: AsyncSession) -> Dict[str, Any]:
    """Retrieves customer account profile and subscription status."""
    stmt = select(Customer).where(
        (Customer.customer_code == customer_code_or_email) | 
        (Customer.email == customer_code_or_email)
    )
    res = await db.execute(stmt)
    customer = res.scalars().first()
    if not customer:
        return {"found": False, "message": f"Customer not found for '{customer_code_or_email}'"}
    
    return {
        "found": True,
        "id": customer.id,
        "customer_code": customer.customer_code,
        "name": customer.name,
        "email": customer.email,
        "company": customer.company,
        "subscription_tier": customer.subscription_tier,
        "subscription_status": customer.subscription_status,
        "monthly_rate": customer.monthly_rate,
        "current_balance": customer.current_balance,
        "payment_method": customer.payment_method,
        "mfa_enabled": customer.mfa_enabled
    }

async def tool_get_billing_invoices(customer_id: str, db: AsyncSession) -> Dict[str, Any]:
    """Fetches recent billing invoices and checks for duplicate charges."""
    stmt = select(Invoice).where(Invoice.customer_id == customer_id).order_by(Invoice.billing_date.desc())
    res = await db.execute(stmt)
    invoices = res.scalars().all()
    
    invoices_list = [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "amount": inv.amount,
            "currency": inv.currency,
            "status": inv.status,
            "description": inv.description,
            "billing_date": inv.billing_date.strftime("%Y-%m-%d %H:%M:%S") if inv.billing_date else None,
            "paid_at": inv.paid_at.strftime("%Y-%m-%d %H:%M:%S") if inv.paid_at else None,
        }
        for inv in invoices
    ]
    
    # Check for potential duplicates
    has_duplicates = any(inv["status"] == "duplicate_charge" for inv in invoices_list)
    
    return {
        "customer_id": customer_id,
        "total_invoices": len(invoices_list),
        "invoices": invoices_list,
        "detected_duplicate_charges": has_duplicates
    }
