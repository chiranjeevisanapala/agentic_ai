import time
import uuid
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.agents.state import MultiAgentWorkflowState
from app.agents.triage_agent import TriageAgent
from app.agents.context_agent import CustomerContextAgent
from app.agents.knowledge_agent import KnowledgeRetrievalAgent
from app.agents.resolution_agent import ResolutionAgent
from app.agents.escalation_agent import EscalationAgent
from app.agents.reviewer_agent import ReviewerAgent

from app.models.ticket import Ticket, TicketMessage, TicketStatus, TicketPriority, TicketCategory
from app.models.agent_trace import AgentTrace
from app.schemas.ticket import ResolutionResult
from app.schemas.agent import AgentStepTrace

class MultiAgentOrchestrator:
    """
    Central Multi-Agent Workflow Orchestrator.
    Executes the sequential resolution graph across 6 specialized agents:
    Triage -> Customer Context -> Knowledge Retrieval (RAG) -> Resolution -> Escalation -> Reviewer.
    """
    def __init__(self):
        self.triage_agent = TriageAgent()
        self.context_agent = CustomerContextAgent()
        self.knowledge_agent = KnowledgeRetrievalAgent()
        self.resolution_agent = ResolutionAgent()
        self.escalation_agent = EscalationAgent()
        self.reviewer_agent = ReviewerAgent()

    async def execute_workflow(
        self,
        customer_query: str,
        customer_id: Optional[str] = None,
        ticket_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        db: Optional[AsyncSession] = None
    ) -> ResolutionResult:
        start_overall = time.time()
        
        # 1. Initialize State
        ticket_number = f"TCK-{int(time.time()) % 100000:05d}"
        state: MultiAgentWorkflowState = {
            "ticket_id": ticket_id,
            "ticket_number": ticket_number,
            "customer_id": customer_id,
            "customer_query": customer_query,
            "conversation_history": conversation_history or [],
            "step_traces": [],
            "total_latency_ms": 0,
        }

        all_traces: List[Dict[str, Any]] = []

        # Step 1: Triage Agent
        triage_out = await self.triage_agent.run(state)
        state.update(triage_out)
        all_traces.extend(triage_out.get("step_traces", []))

        # Step 2: Customer Context Agent
        context_out = await self.context_agent.run(state, db)
        state.update(context_out)
        all_traces.extend(context_out.get("step_traces", []))

        # Step 3: Knowledge Retrieval Agent (RAG)
        knowledge_out = await self.knowledge_agent.run(state)
        state.update(knowledge_out)
        all_traces.extend(knowledge_out.get("step_traces", []))

        # Step 4: Resolution Agent
        resolution_out = await self.resolution_agent.run(state, db)
        state.update(resolution_out)
        all_traces.extend(resolution_out.get("step_traces", []))

        # Step 5: Escalation Agent
        escalation_out = await self.escalation_agent.run(state)
        state.update(escalation_out)
        all_traces.extend(escalation_out.get("step_traces", []))

        # Step 6: Decision / Reviewer Agent
        reviewer_out = await self.reviewer_agent.run(state)
        state.update(reviewer_out)
        all_traces.extend(reviewer_out.get("step_traces", []))

        total_latency = int((time.time() - start_overall) * 1000)

        # Build or Update Ticket in Database
        active_customer_id = state.get("customer_profile", {}).get("id") or customer_id
        if not active_customer_id and db:
            from app.models.customer import Customer
            c_res = await db.execute(select(Customer).limit(1))
            c_obj = c_res.scalars().first()
            if c_obj:
                active_customer_id = c_obj.id

        created_ticket_id = ticket_id or str(uuid.uuid4())

        if db and active_customer_id:
            # Check if ticket exists or create new
            if ticket_id:
                res = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
                ticket_model = res.scalars().first()
            else:
                ticket_model = None

            if not ticket_model:
                ticket_model = Ticket(
                    id=created_ticket_id,
                    ticket_number=ticket_number,
                    customer_id=active_customer_id,
                    customer_query=customer_query,
                    issue_category=state.get("issue_category", "General Inquiry"),
                    priority=state.get("priority", "Medium"),
                    status=state.get("final_status", "Resolved"),
                    suggested_resolution=state.get("suggested_resolution", ""),
                    final_response=state.get("final_response", ""),
                    retrieved_knowledge=state.get("retrieved_knowledge", []),
                    customer_context_snapshot=state.get("customer_profile", {}),
                    recommended_actions=state.get("recommended_actions", []),
                    actions_performed=state.get("actions_performed", []),
                    escalation_status="Escalated" if state.get("is_escalated") else "None",
                    escalation_reason=state.get("escalation_reason"),
                    escalation_summary=state.get("escalation_summary"),
                    assigned_human_agent=state.get("assigned_team") if state.get("is_escalated") else None,
                    reviewer_approved="Approved" if state.get("reviewer_approved") else "Rejected",
                    reviewer_notes=state.get("reviewer_notes"),
                    confidence_score=str(state.get("quality_score", 0.98))
                )
                db.add(ticket_model)
            else:
                ticket_model.status = state.get("final_status", ticket_model.status)
                ticket_model.suggested_resolution = state.get("suggested_resolution")
                ticket_model.final_response = state.get("final_response")
                ticket_model.actions_performed = state.get("actions_performed")
                ticket_model.escalation_status = "Escalated" if state.get("is_escalated") else "None"
                ticket_model.escalation_reason = state.get("escalation_reason")

            # Add customer message & system resolution message
            msg_user = TicketMessage(
                ticket_id=created_ticket_id,
                sender_type="customer",
                sender_name=state.get("customer_profile", {}).get("name", "Customer"),
                content=customer_query
            )
            msg_system = TicketMessage(
                ticket_id=created_ticket_id,
                sender_type="agent_system",
                sender_name="AI Support Resolution System",
                content=state.get("final_response", ""),
                metadata_json={
                    "actions_performed": state.get("actions_performed", []),
                    "status": state.get("final_status", "Resolved"),
                    "category": state.get("issue_category", "General")
                }
            )
            db.add(msg_user)
            db.add(msg_system)

            # Persist agent traces
            for trace_data in all_traces:
                trace_model = AgentTrace(
                    ticket_id=created_ticket_id,
                    agent_name=trace_data.get("agent_name"),
                    agent_role=trace_data.get("agent_role"),
                    step_order=trace_data.get("step_order", 1),
                    status=trace_data.get("status", "COMPLETED"),
                    latency_ms=trace_data.get("latency_ms", 0),
                    thought_process=trace_data.get("thought_process"),
                    input_data=trace_data.get("input_data", {}),
                    output_data=trace_data.get("output_data", {}),
                    tool_calls=trace_data.get("tool_calls", []),
                    confidence=trace_data.get("confidence", 1.0)
                )
                db.add(trace_model)

            await db.commit()

        # Format typed response
        agent_traces_typed = [AgentStepTrace(**t) for t in all_traces]

        return ResolutionResult(
            ticket_id=created_ticket_id,
            ticket_number=ticket_number,
            ticket_status=state.get("final_status", "Resolved"),
            customer_query=customer_query,
            issue_category=state.get("issue_category", "General Inquiry"),
            priority=state.get("priority", "Medium"),
            retrieved_knowledge=state.get("retrieved_knowledge", []),
            suggested_resolution=state.get("suggested_resolution", ""),
            recommended_actions=state.get("recommended_actions", []),
            actions_performed=state.get("actions_performed", []),
            escalation_status="Escalated" if state.get("is_escalated") else "None",
            escalation_reason=state.get("escalation_reason"),
            escalation_summary=state.get("escalation_summary"),
            agent_execution_history=agent_traces_typed,
            final_response=state.get("final_response", ""),
            confidence_score=state.get("quality_score", 0.98),
            reviewer_verdict={
                "approved": state.get("reviewer_approved", True),
                "policy_check": state.get("policy_compliance", "PASS"),
                "hallucination_check": state.get("hallucination_check", "PASS"),
                "safety_check": state.get("safety_check", "PASS"),
                "notes": state.get("reviewer_notes", "")
            }
        )

orchestrator = MultiAgentOrchestrator()
