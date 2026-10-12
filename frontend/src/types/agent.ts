export interface ToolExecutionRecord {
  tool_name: string;
  tool_category: 'READ_ONLY' | 'SAFE_WRITE' | 'HIGH_RISK';
  parameters: Record<string, any>;
  result: Record<string, any>;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED_REQUIRES_HUMAN';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp?: string;
}

export interface AgentStepTrace {
  agent_name: string;
  agent_role: string;
  step_order: number;
  status: 'RUNNING' | 'COMPLETED' | 'ESCALATED' | 'FAILED' | 'SKIPPED';
  thought_process: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  tool_calls: any[];
  latency_ms: number;
  confidence: number;
}

export interface ReviewerVerdict {
  approved: boolean;
  policy_check: string;
  hallucination_check: string;
  safety_check: string;
  notes: string;
}

export interface ResolutionResult {
  ticket_id: string;
  ticket_number: string;
  ticket_status: 'Resolved' | 'Requires More Information' | 'Escalated' | 'Pending Review' | 'Open';
  customer_query: string;
  issue_category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  retrieved_knowledge: Array<{
    article_code: string;
    title: string;
    category: string;
    snippet: string;
    similarity_score: number;
    policy_reference?: string;
    action_permissions?: string[];
  }>;
  suggested_resolution: string;
  recommended_actions: Array<{
    action: string;
    type?: string;
    reason?: string;
    priority?: string;
    amount?: number;
    status?: string;
  }>;
  actions_performed: Array<{
    action_name: string;
    status: string;
    details: Record<string, any>;
    risk_level: string;
    timestamp?: string;
  }>;
  escalation_status: string;
  escalation_reason?: string | null;
  escalation_summary?: string | null;
  agent_execution_history: AgentStepTrace[];
  final_response: string;
  confidence_score: number;
  reviewer_verdict: ReviewerVerdict;
}
