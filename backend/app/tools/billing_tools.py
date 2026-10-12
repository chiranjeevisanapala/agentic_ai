from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.customer import Customer, Invoice
from app.config import settings

async def tool_issue_refund(
    customer_id: str,
    invoice_number: str,
    amount: float,
    reason: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Issues a refund for a specific invoice.
    Enforces the $100 auto-approval limit. Amounts > $100 return BLOCKED_REQUIRES_HUMAN.
    """
    if amount > settings.REFUND_AUTO_APPROVE_LIMIT:
        return {
            "success": False,
            "status": "BLOCKED_REQUIRES_HUMAN",
            "risk_level": "HIGH",
            "message": f"Refund amount ${amount:.2f} exceeds automated threshold of ${settings.REFUND_AUTO_APPROVE_LIMIT:.2f}. Escalating to Tier 2 Billing Manager for manual authorization.",
            "invoice_number": invoice_number,
            "amount": amount,
            "requires_escalation": True
        }

    stmt = select(Invoice).where(
        (Invoice.customer_id == customer_id) & 
        (Invoice.invoice_number == invoice_number)
    )
    res = await db.execute(stmt)
    invoice = res.scalars().first()
    
    if invoice:
        invoice.status = "refunded"
        await db.commit()
    
    return {
        "success": True,
        "status": "EXECUTED",
        "risk_level": "LOW",
        "action": "issue_refund",
        "refund_id": f"ref_auto_{int(datetime.utcnow().timestamp())}",
        "invoice_number": invoice_number,
        "amount_refunded": amount,
        "currency": "USD",
        "reason": reason,
        "estimated_arrival": "3-5 business days to original payment method",
        "message": f"Successfully processed refund of ${amount:.2f} for {invoice_number}."
    }

async def tool_apply_billing_credit(
    customer_id: str,
    amount: float,
    reason: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """Applies courtesy or compensation billing credit to customer account balance."""
    stmt = select(Customer).where(Customer.id == customer_id)
    res = await db.execute(stmt)
    customer = res.scalars().first()
    
    if customer:
        customer.current_balance = round(customer.current_balance - amount, 2)
        await db.commit()

    return {
        "success": True,
        "status": "EXECUTED",
        "risk_level": "LOW",
        "action": "apply_billing_credit",
        "credit_amount": amount,
        "new_balance": customer.current_balance if customer else 0.0,
        "reason": reason,
        "message": f"Applied courtesy credit of ${amount:.2f} to customer account."
    }

async def tool_resend_invoice_receipt(
    customer_id: str,
    invoice_number: str,
    destination_email: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """Resends PDF invoice receipt to registered customer email."""
    return {
        "success": True,
        "status": "EXECUTED",
        "risk_level": "LOW",
        "action": "resend_invoice_receipt",
        "invoice_number": invoice_number,
        "destination_email": destination_email,
        "sent_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "message": f"Official invoice receipt for {invoice_number} sent to {destination_email}."
    }
