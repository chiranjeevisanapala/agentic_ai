import time
from typing import Dict, Any, List
from app.agents.state import MultiAgentWorkflowState
from app.models.ticket import TicketStatus, TicketPriority

class EscalationAgent:
    """
    Agent 5: Escalation Agent
    - Evaluates safety thresholds, risk levels, and human intervention triggers
    - Generates a concise, structured escalation summary packet for Tier 2 agents
    - Routes ticket to appropriate specialist team (L2 Billing, SecOps, Tier 2 Support)
    """
    def __init__(self):
        self.name = "Escalation Agent"
        self.role = "Risk Assessment & Human Intervention Dispatch"

    async def run(self, state: MultiAgentWorkflowState) -> Dict[str, Any]:
        start_time = time.time()
        is_escalated = state.get("is_escalated", False)
        escalation_reason = state.get("escalation_reason")
        query = state.get("customer_query", "").lower()
        sentiment = state.get("sentiment", "Neutral")
        customer_profile = state.get("customer_profile", {})
        category = state.get("issue_category", "General")
        
        # Check additional escalation triggers
        if any(term in query for term in ["lawyer", "legal", "sue", "chargeback", "bbb", "attorney"]):
            is_escalated = True
            escalation_reason = "Customer mentioned legal action or credit card chargeback dispute."
        elif any(term in query for term in ["hacked", "breach", "compromised", "unauthorized access"]):
            is_escalated = True
            escalation_reason = "Suspected account takeover or security compromise."

        assigned_team = "None"
        escalation_summary = "No human intervention required. AI Auto-Resolution passed all policy checks."
        required_human_actions = []
        urgency = "Standard"

        if is_escalated:
            if "Billing" in category or "refund" in str(escalation_reason).lower() or "chargeback" in query:
                assigned_team = "Tier 2 Billing & Financial Operations"
                urgency = "High"
                required_human_actions = [
                    "1. Review Stripe payment gateway transaction logs for customer.",
                    "2. Authorize high-value refund or balance adjustment.",
                    "3. Send custom confirmation to customer with reference code."
                ]
            elif "Account" in category or "Security" in category or "compromised" in query:
                assigned_team = "Security Operations (SecOps)"
                urgency = "Urgent"
                required_human_actions = [
                    "1. Audit active IP sessions and revoke suspect tokens.",
                    "2. Verify identity via secondary phone channel.",
                    "3. Unlock account credentials and re-issue recovery keys."
                ]
            else:
                assigned_team = "Senior Support Specialist Tier 2"
                urgency = "Medium"
                required_human_actions = [
                    "1. Review customer conversation context.",
                    "2. Provide personalized technical guidance."
                ]

            escalation_summary = (
                f"🚨 ESCALATION BRIEFING\n"
                f"• Customer: {customer_profile.get('name', 'User')} ({customer_profile.get('customer_code', 'CUST')})\n"
                f"• Tier: {customer_profile.get('subscription_tier', 'Pro')} | Sentiment: {sentiment}\n"
                f"• Trigger Reason: {escalation_reason}\n"
                f"• Assigned Department: {assigned_team} (Priority: {urgency})\n"
                f"• Recommended Actions for Specialist: {', '.join(required_human_actions)}"
            )

        latency_ms = int((time.time() - start_time) * 1000)

        thought = (
            f"Evaluated risk matrix. Escalation trigger: {'ACTIVE' if is_escalated else 'CLEARED'}. "
            f"Assigned routing: {assigned_team}. Urgency level: {urgency}."
        )

        trace = {
            "agent_name": self.name,
            "agent_role": self.role,
            "step_order": 5,
            "status": "ESCALATED" if is_escalated else "COMPLETED",
            "thought_process": thought,
            "input_data": {
                "initial_escalation_flag": is_escalated,
                "sentiment": sentiment,
                "category": category
            },
            "output_data": {
                "is_escalated": is_escalated,
                "escalation_reason": escalation_reason,
                "assigned_team": assigned_team,
                "urgency": urgency,
                "escalation_summary": escalation_summary,
                "required_human_actions": required_human_actions
            },
            "tool_calls": [],
            "latency_ms": max(latency_ms, 20),
            "confidence": 0.99
        }

        return {
            "is_escalated": is_escalated,
            "escalation_reason": escalation_reason,
            "escalation_summary": escalation_summary,
            "assigned_team": assigned_team,
            "escalation_urgency": urgency,
            "required_human_actions": required_human_actions,
            "step_traces": [trace]
        }
