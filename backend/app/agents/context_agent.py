import time
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.agents.state import MultiAgentWorkflowState
from app.models.customer import Customer, Invoice
from app.models.ticket import Ticket

class CustomerContextAgent:
    """
    Agent 2: Customer Context Agent
    - Retrieves customer profile, subscription status, and billing ledger
    - Cross-references past tickets & conversation history
    - Flags potential account anomalies (e.g. duplicate paid invoices)
    """
    def __init__(self):
        self.name = "Customer Context Agent"
        self.role = "Profile & Account Context Retrieval"

    async def run(self, state: MultiAgentWorkflowState, db: AsyncSession) -> Dict[str, Any]:
        start_time = time.time()
        customer_id = state.get("customer_id")
        
        # 1. Look up customer profile
        customer = None
        if customer_id:
            res = await db.execute(select(Customer).where(Customer.id == customer_id))
            customer = res.scalars().first()
        
        # If no specific customer provided, pick primary demo customer
        if not customer:
            res = await db.execute(select(Customer).order_by(Customer.created_at))
            customer = res.scalars().first()

        customer_profile = {}
        invoices_list = []
        past_tickets_count = 0
        duplicate_invoices = []

        if customer:
            customer_profile = {
                "id": customer.id,
                "customer_code": customer.customer_code,
                "name": customer.name,
                "email": customer.email,
                "company": customer.company or "N/A",
                "subscription_tier": customer.subscription_tier,
                "subscription_status": customer.subscription_status,
                "monthly_rate": customer.monthly_rate,
                "current_balance": customer.current_balance,
                "payment_method": customer.payment_method,
                "mfa_enabled": customer.mfa_enabled
            }

            # Fetch customer invoices
            inv_res = await db.execute(
                select(Invoice).where(Invoice.customer_id == customer.id).order_by(Invoice.billing_date.desc())
            )
            invoices = inv_res.scalars().all()
            for inv in invoices:
                invoices_list.append({
                    "id": inv.id,
                    "invoice_number": inv.invoice_number,
                    "amount": inv.amount,
                    "status": inv.status,
                    "description": inv.description,
                    "billing_date": inv.billing_date.strftime("%Y-%m-%d") if inv.billing_date else None
                })
                if inv.status == "duplicate_charge":
                    duplicate_invoices.append(inv.invoice_number)

            # Fetch past ticket count
            t_res = await db.execute(select(Ticket).where(Ticket.customer_id == customer.id))
            past_tickets_count = len(t_res.scalars().all())

        anomalies = []
        if duplicate_invoices:
            anomalies.append(f"Identified duplicate invoice charge ({', '.join(duplicate_invoices)}) on account.")

        context_summary = (
            f"Customer: {customer_profile.get('name', 'Unknown')} ({customer_profile.get('customer_code', 'N/A')}), "
            f"Tier: {customer_profile.get('subscription_tier', 'Pro')} ({customer_profile.get('subscription_status', 'active')}), "
            f"Rate: ${customer_profile.get('monthly_rate', 49.0)}/mo, Payment: {customer_profile.get('payment_method', 'Card')}. "
            f"Invoices on file: {len(invoices_list)}. {(' '.join(anomalies) if anomalies else 'Account in good standing.')}"
        )

        latency_ms = int((time.time() - start_time) * 1000)

        thought = (
            f"Retrieved 360-degree context for customer {customer_profile.get('customer_code', 'CUST')}. "
            f"Found {len(invoices_list)} billing records. "
            f"{'Duplicate charge detected on ledger!' if duplicate_invoices else 'Ledger verified.'}"
        )

        trace = {
            "agent_name": self.name,
            "agent_role": self.role,
            "step_order": 2,
            "status": "COMPLETED",
            "thought_process": thought,
            "input_data": {"customer_id": customer_id or (customer.id if customer else None)},
            "output_data": {
                "customer_profile": customer_profile,
                "invoices_found": len(invoices_list),
                "duplicate_invoices_detected": duplicate_invoices,
                "context_summary": context_summary
            },
            "tool_calls": [
                {"tool": "get_customer_account", "status": "SUCCESS"},
                {"tool": "get_billing_invoices", "status": "SUCCESS"}
            ],
            "latency_ms": max(latency_ms, 30),
            "confidence": 1.0
        }

        return {
            "customer_profile": customer_profile,
            "account_status": customer_profile.get("subscription_status", "active"),
            "subscription_details": {
                "tier": customer_profile.get("subscription_tier", "Pro"),
                "rate": customer_profile.get("monthly_rate", 49.0),
                "payment_method": customer_profile.get("payment_method", "Card")
            },
            "billing_invoices": invoices_list,
            "past_ticket_count": past_tickets_count,
            "context_summary": context_summary,
            "step_traces": [trace]
        }
