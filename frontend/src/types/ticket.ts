import { AgentStepTrace, ReviewerVerdict } from './agent';

export interface CustomerProfile {
  id: string;
  customer_code: string;
  name: string;
  email: string;
  company?: string;
  subscription_tier: string;
  subscription_status: string;
  monthly_rate: number;
  current_balance: number;
  renewal_date?: string;
  payment_method: string;
  mfa_enabled: string;
  metadata_json?: Record<string, any>;
  created_at?: string;
  invoices?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  billing_date: string;
  paid_at?: string;
  pdf_url?: string;
}

export interface TicketMessageItem {
  id: string;
  ticket_id: string;
  sender_type: 'customer' | 'agent_system' | 'human_agent' | 'system_event';
  sender_name: string;
  content: string;
  metadata_json?: Record<string, any>;
  created_at: string;
}

export interface TicketItem {
  id: string;
  ticket_number: string;
  customer_id: string;
  customer_query: string;
  issue_category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Resolved' | 'Requires More Information' | 'Escalated' | 'Pending Review' | 'Open';
  suggested_resolution?: string;
  final_response?: string;
  retrieved_knowledge?: any[];
  recommended_actions?: any[];
  actions_performed?: any[];
  escalation_status: string;
  escalation_reason?: string;
  escalation_summary?: string;
  assigned_human_agent?: string;
  reviewer_approved?: string;
  reviewer_notes?: string;
  confidence_score?: string;
  created_at: string;
  updated_at: string;
  customer?: CustomerProfile;
  messages?: TicketMessageItem[];
  agent_traces?: AgentStepTrace[];
}
