import { ResolutionResult } from '../types/agent';
import { CustomerProfile, TicketItem } from '../types/ticket';
import { KnowledgeArticle } from '../types/knowledge';

export const MOCK_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-1',
    customer_code: 'CUST-10492',
    name: 'Alex Rivera',
    email: 'alex.rivera@techcorp.io',
    company: 'TechCorp Solutions',
    subscription_tier: 'Pro',
    subscription_status: 'active',
    monthly_rate: 49.0,
    current_balance: 0.0,
    renewal_date: '2025-11-03T10:00:00Z',
    payment_method: 'Visa ending in 4242',
    mfa_enabled: 'Enabled (TOTP)',
    invoices: [
      {
        id: 'inv-1',
        invoice_number: 'INV-2025-001',
        amount: 49.0,
        currency: 'USD',
        status: 'paid',
        description: 'Pro Monthly Plan (Oct 2025 - Nov 2025)',
        billing_date: '2025-10-01T09:12:00Z'
      },
      {
        id: 'inv-2',
        invoice_number: 'INV-2025-002',
        amount: 49.0,
        currency: 'USD',
        status: 'duplicate_charge',
        description: 'Pro Monthly Plan (Duplicate automated renewal)',
        billing_date: '2025-10-02T14:20:00Z'
      }
    ]
  },
  {
    id: 'cust-2',
    customer_code: 'CUST-88301',
    name: 'Elena Vance',
    email: 'elena.vance@blackmesa.org',
    company: 'Black Mesa Research',
    subscription_tier: 'Enterprise',
    subscription_status: 'active',
    monthly_rate: 299.0,
    current_balance: 0.0,
    renewal_date: '2025-10-28T08:00:00Z',
    payment_method: 'Mastercard ending in 8831',
    mfa_enabled: 'Enabled (Hardware Key)',
    invoices: [
      {
        id: 'inv-3',
        invoice_number: 'INV-2025-045',
        amount: 299.0,
        currency: 'USD',
        status: 'duplicate_charge',
        description: 'Enterprise Monthly Renewal (High Value)',
        billing_date: '2025-10-05T11:00:00Z'
      }
    ]
  },
  {
    id: 'cust-3',
    customer_code: 'CUST-33109',
    name: 'Marcus Chen',
    email: 'marcus.chen@devflow.io',
    company: 'DevFlow OpenSource',
    subscription_tier: 'Free',
    subscription_status: 'active',
    monthly_rate: 0.0,
    current_balance: 0.0,
    payment_method: 'None',
    mfa_enabled: 'Disabled',
    invoices: []
  }
];

export const MOCK_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    article_code: 'KB-BILL-001',
    title: 'Duplicate Billing Charge Resolution & Refund Policy',
    category: 'Billing & Payments',
    policy_reference: 'POL-BILL-2025-01',
    tags: ['duplicate charge', 'refund', 'stripe', 'invoice'],
    action_permissions: ['issue_refund', 'apply_billing_credit', 'resend_receipt'],
    summary: 'Policy for detecting, validating, and automatically refunding duplicate subscription charges occurring within 7 days.',
    content: 'Full policy detailing eligibility, $100 auto-approval threshold, and 3-5 day bank processing times.'
  },
  {
    id: 'kb-2',
    article_code: 'KB-SUB-002',
    title: 'Subscription Upgrade, Downgrade & Proration Guidelines',
    category: 'Subscription & Plans',
    policy_reference: 'POL-SUB-2024-03',
    tags: ['upgrade', 'downgrade', 'proration', 'pro', 'enterprise'],
    action_permissions: ['upgrade_subscription_tier', 'apply_billing_credit'],
    summary: 'Rules for upgrading or downgrading plans, pro-rated billing calculation, and feature unlocks.',
    content: 'Prorated upgrade differences applied immediately, downgrades occur at billing cycle close.'
  },
  {
    id: 'kb-3',
    article_code: 'KB-SEC-003',
    title: 'Account Access, 2FA / MFA Reset & Security Lockouts',
    category: 'Account & Security',
    policy_reference: 'POL-SEC-2025-04',
    tags: ['2fa', 'mfa', 'locked out', 'security'],
    action_permissions: ['send_password_reset_email', 'reset_mfa_device'],
    summary: 'Verification protocols for resetting Multi-Factor Authentication (MFA) devices and password recovery.',
    content: 'MFA challenge emails expire in 15 minutes. High-risk takeovers escalated to SecOps immediately.'
  },
  {
    id: 'kb-4',
    article_code: 'KB-TECH-004',
    title: 'API Rate Limits, 429 Too Many Requests & Quotas',
    category: 'Technical Support',
    policy_reference: 'POL-TECH-2025-02',
    tags: ['api', 'rate limit', '429', 'quota'],
    action_permissions: ['sync_api_quota', 'apply_billing_credit'],
    summary: 'Troubleshooting 429 Too Many Requests errors, rate limit headers, and temporary quota expansion.',
    content: 'Pro Tier allows 120 req/min (burst 200). Use X-RateLimit-Reset headers for retry-after backoff.'
  }
];

export const MOCK_INITIAL_RESOLUTION: ResolutionResult = {
  ticket_id: 'tck-init-1',
  ticket_number: 'TCK-89420',
  ticket_status: 'Resolved',
  customer_query: 'I was charged twice for my subscription this month. Please check the issue and tell me what I should do.',
  issue_category: 'Billing & Payments',
  priority: 'High',
  retrieved_knowledge: [
    {
      article_code: 'KB-BILL-001',
      title: 'Duplicate Billing Charge Resolution & Refund Policy',
      category: 'Billing & Payments',
      snippet: 'Authorized to auto-refund duplicate invoice charges up to $100.00 USD occurring within 7 days.',
      similarity_score: 0.94,
      policy_reference: 'POL-BILL-2025-01',
      action_permissions: ['issue_refund', 'apply_billing_credit', 'resend_receipt']
    }
  ],
  suggested_resolution: 'Identified duplicate monthly subscription charge on invoice #INV-2025-002 for $49.00. Auto-processed full refund to Visa ending in 4242.',
  recommended_actions: [
    { action: 'Monitor next billing cycle on Nov 3 for recurring sync', type: 'Advisory' },
    { action: 'Download updated invoice statement from customer portal', type: 'Customer Action' }
  ],
  actions_performed: [
    {
      action_name: 'issue_refund',
      status: 'SUCCESS',
      details: {
        invoice_number: 'INV-2025-002',
        amount_refunded: 49.0,
        currency: 'USD',
        estimated_arrival: '3-5 business days'
      },
      risk_level: 'LOW',
      timestamp: '2025-10-11T07:35:00Z'
    }
  ],
  escalation_status: 'None',
  escalation_reason: null,
  escalation_summary: 'No human intervention required. AI Auto-Resolution executed within $100 policy boundary.',
  agent_execution_history: [
    {
      agent_name: 'Triage Agent',
      agent_role: 'Intent Classification & Urgency Assessment',
      step_order: 1,
      status: 'COMPLETED',
      thought_process: "Analyzed customer query. Classified issue under 'Billing & Payments' domain with priority 'High'. Detected sentiment is 'Frustrated'. Primary intent: Resolve duplicate billing charge & request refund.",
      input_data: { customer_query: 'I was charged twice for my subscription this month. Please check the issue and tell me what I should do.' },
      output_data: { category: 'Billing & Payments', priority: 'High', urgency_level: 'Elevated', intent: 'Duplicate charge refund' },
      tool_calls: [],
      latency_ms: 32,
      confidence: 0.99
    },
    {
      agent_name: 'Customer Context Agent',
      agent_role: 'Profile & Account Context Retrieval',
      step_order: 2,
      status: 'COMPLETED',
      thought_process: 'Retrieved 360-degree context for customer Alex Rivera (CUST-10492). Found 2 billing records for current cycle. Duplicate charge detected on ledger: INV-2025-002 for $49.00.',
      input_data: { customer_code: 'CUST-10492' },
      output_data: { subscription_tier: 'Pro', monthly_rate: 49.0, duplicate_found: true, invoice: 'INV-2025-002' },
      tool_calls: [{ tool: 'get_customer_account' }, { tool: 'get_billing_invoices' }],
      latency_ms: 45,
      confidence: 1.0
    },
    {
      agent_name: 'Knowledge Retrieval Agent',
      agent_role: 'Vector RAG & Policy Search',
      step_order: 3,
      status: 'COMPLETED',
      thought_process: 'Executed vector similarity search for query. Found matching document KB-BILL-001 (Similarity: 94.2%). Policy POL-BILL-2025-01 authorizes automated refund for amounts <= $100.',
      input_data: { query: 'charged twice subscription refund' },
      output_data: { matched_policy: 'POL-BILL-2025-01', auto_refund_limit: 100.0, action_permissions: ['issue_refund'] },
      tool_calls: [{ tool: 'vector_store_search' }],
      latency_ms: 51,
      confidence: 0.96
    },
    {
      agent_name: 'Resolution Agent',
      agent_role: 'Solution Synthesis & Safe Tool Execution',
      step_order: 4,
      status: 'COMPLETED',
      thought_process: 'Duplicate invoice charge amount is $49.00 <= $100.00 auto limit. Executed automated tool `issue_refund` for invoice INV-2025-002.',
      input_data: { invoice_number: 'INV-2025-002', amount: 49.0 },
      output_data: { refund_status: 'SUCCESS', refund_id: 'ref_auto_9831' },
      tool_calls: [{ tool: 'issue_refund', status: 'SUCCESS', amount: 49.0 }],
      latency_ms: 68,
      confidence: 0.98
    },
    {
      agent_name: 'Escalation Agent',
      agent_role: 'Risk Assessment & Human Intervention Dispatch',
      step_order: 5,
      status: 'COMPLETED',
      thought_process: 'Evaluated risk matrix. Refund amount is $49.00 (within safe bounds). No legal threats or account compromises detected. Escalation cleared.',
      input_data: { risk_level: 'LOW', amount: 49.0 },
      output_data: { is_escalated: false, assigned_team: 'None' },
      tool_calls: [],
      latency_ms: 18,
      confidence: 1.0
    },
    {
      agent_name: 'Decision / Reviewer Agent',
      agent_role: 'Quality Assurance & Policy Compliance Verification',
      step_order: 6,
      status: 'COMPLETED',
      thought_process: 'Conducted rigorous QA review of proposed resolution. Policy Compliance: PASS | Hallucination Check: PASS | Safety: PASS. Response approved for delivery.',
      input_data: { final_ticket_status: 'Resolved' },
      output_data: { quality_score: 0.98, policy_check: 'PASS', safety_check: 'PASS', is_approved: true },
      tool_calls: [],
      latency_ms: 36,
      confidence: 0.99
    }
  ],
  final_response: `Hello Alex,\n\nThank you for contacting support. I have checked your account (CUST-10492) and confirmed that you were mistakenly billed twice for your Pro subscription.\n\n✅ **Action Taken**: I have automatically processed a full refund of **$49.00** for duplicate invoice **#INV-2025-002**.\n\n• **Refund Method**: Credited back to your Visa ending in 4242.\n• **Timeline**: Please allow 3-5 business days for the funds to reflect on your bank statement.\n• **Account Status**: Your Pro subscription remains active with zero interruption.\n\nPlease let me know if you need anything else!`,
  confidence_score: 0.98,
  reviewer_verdict: {
    approved: true,
    policy_check: 'PASS',
    hallucination_check: 'PASS',
    safety_check: 'PASS',
    notes: 'Solution verified against policy POL-BILL-2025-01. Automated refund executed safely.'
  }
};
