from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.tools.base import ToolDefinition, ToolCategory, RiskLevel
from app.tools.customer_tools import tool_get_customer_account, tool_get_billing_invoices
from app.tools.billing_tools import tool_issue_refund, tool_apply_billing_credit, tool_resend_invoice_receipt
from app.tools.account_tools import tool_reset_mfa_device, tool_send_password_reset, tool_sync_api_quota
from app.models.audit_log import AuditLog
from app.schemas.agent import ToolExecutionRecord

AVAILABLE_TOOLS: Dict[str, ToolDefinition] = {
    "get_customer_account": ToolDefinition(
        name="get_customer_account",
        description="Lookup customer profile, subscription status, and details by code or email",
        category=ToolCategory.READ_ONLY,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
    "get_billing_invoices": ToolDefinition(
        name="get_billing_invoices",
        description="Fetch customer invoice history and detect duplicate charges",
        category=ToolCategory.READ_ONLY,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
    "issue_refund": ToolDefinition(
        name="issue_refund",
        description="Process refund for duplicate or erroneous invoice (Auto-approved <= $100)",
        category=ToolCategory.SAFE_WRITE,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
    "apply_billing_credit": ToolDefinition(
        name="apply_billing_credit",
        description="Apply courtesy billing credit to customer account balance",
        category=ToolCategory.SAFE_WRITE,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
    "resend_invoice_receipt": ToolDefinition(
        name="resend_invoice_receipt",
        description="Resend PDF invoice receipt to registered customer email",
        category=ToolCategory.SAFE_WRITE,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
    "reset_mfa_device": ToolDefinition(
        name="reset_mfa_device",
        description="Issue verified MFA reset link to customer email",
        category=ToolCategory.SAFE_WRITE,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
    "send_password_reset": ToolDefinition(
        name="send_password_reset",
        description="Send password reset link to customer email",
        category=ToolCategory.SAFE_WRITE,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
    "sync_api_quota": ToolDefinition(
        name="sync_api_quota",
        description="Refresh rate limit cache and clear 429 locks",
        category=ToolCategory.SAFE_WRITE,
        risk_level=RiskLevel.LOW,
        requires_human_approval=False,
    ),
}

class ToolExecutor:
    """
    Central tool execution engine.
    Ensures clear separation between recommended actions vs executed actions,
    enforces policy rules, blocks unauthorized tool executions, and writes audit logs.
    """
    @staticmethod
    async def execute(
        tool_name: str,
        params: Dict[str, Any],
        db: AsyncSession,
        ticket_id: Optional[str] = None,
        customer_id: Optional[str] = None
    ) -> ToolExecutionRecord:
        if tool_name not in AVAILABLE_TOOLS:
            return ToolExecutionRecord(
                tool_name=tool_name,
                tool_category="UNKNOWN",
                parameters=params,
                result={"error": f"Tool '{tool_name}' not recognized or unsupported."},
                status="FAILED",
                risk_level="HIGH",
                timestamp=datetime.utcnow()
            )

        tool_meta = AVAILABLE_TOOLS[tool_name]
        result: Dict[str, Any] = {}
        status = "SUCCESS"
        risk_level = tool_meta.risk_level.value

        try:
            if tool_name == "get_customer_account":
                ident = params.get("customer_code") or params.get("email") or params.get("customer_id")
                result = await tool_get_customer_account(ident, db)
            
            elif tool_name == "get_billing_invoices":
                c_id = params.get("customer_id") or customer_id
                result = await tool_get_billing_invoices(c_id, db)
                
            elif tool_name == "issue_refund":
                c_id = params.get("customer_id") or customer_id
                inv_no = params.get("invoice_number", "")
                amt = float(params.get("amount", 0.0))
                reason = params.get("reason", "Customer support refund")
                result = await tool_issue_refund(c_id, inv_no, amt, reason, db)
                if result.get("status") == "BLOCKED_REQUIRES_HUMAN":
                    status = "BLOCKED_REQUIRES_HUMAN"
                    risk_level = "HIGH"

            elif tool_name == "apply_billing_credit":
                c_id = params.get("customer_id") or customer_id
                amt = float(params.get("amount", 10.0))
                reason = params.get("reason", "Customer satisfaction credit")
                result = await tool_apply_billing_credit(c_id, amt, reason, db)

            elif tool_name == "resend_invoice_receipt":
                c_id = params.get("customer_id") or customer_id
                inv_no = params.get("invoice_number", "")
                email = params.get("destination_email", "")
                result = await tool_resend_invoice_receipt(c_id, inv_no, email, db)

            elif tool_name == "reset_mfa_device":
                c_id = params.get("customer_id") or customer_id
                email = params.get("email", "")
                result = await tool_reset_mfa_device(c_id, email, db)

            elif tool_name == "send_password_reset":
                c_id = params.get("customer_id") or customer_id
                email = params.get("email", "")
                result = await tool_send_password_reset(c_id, email, db)

            elif tool_name == "sync_api_quota":
                c_id = params.get("customer_id") or customer_id
                result = await tool_sync_api_quota(c_id, db)

        except Exception as e:
            result = {"error": str(e)}
            status = "FAILED"
            risk_level = "HIGH"

        # Log in Audit Table
        audit = AuditLog(
            ticket_id=ticket_id,
            customer_id=customer_id or params.get("customer_id"),
            tool_name=tool_name,
            tool_category=tool_meta.category.value,
            parameters=params,
            execution_result=result,
            status=status,
            risk_level=risk_level,
            amount=params.get("amount") if isinstance(params.get("amount"), (int, float)) else None
        )
        db.add(audit)
        await db.commit()

        return ToolExecutionRecord(
            tool_name=tool_name,
            tool_category=tool_meta.category.value,
            parameters=params,
            result=result,
            status=status,
            risk_level=risk_level,
            timestamp=datetime.utcnow()
        )
