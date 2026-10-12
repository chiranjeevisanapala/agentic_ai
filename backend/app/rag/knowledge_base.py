from typing import List, Dict, Any

SUPPORT_KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "article_code": "KB-BILL-001",
        "title": "Duplicate Billing Charge Resolution & Refund Policy",
        "category": "Billing & Payments",
        "policy_reference": "POL-BILL-2025-01",
        "tags": ["duplicate charge", "double billing", "refund", "invoice", "overcharge", "stripe"],
        "action_permissions": ["issue_refund", "apply_billing_credit", "resend_receipt"],
        "summary": "Policy for detecting, validating, and automatically refunding duplicate subscription charges occurring within 7 days.",
        "content": """# Duplicate Billing Charge Resolution Policy

## 1. Overview
If a customer is billed multiple times for the same billing cycle or subscription period, the system or agent is authorized to verify transaction IDs and issue an immediate refund for the redundant charge.

## 2. Eligibility Criteria
- The redundant invoice must have occurred within 7 days of the primary renewal charge.
- The invoice status must show 'paid' or 'duplicate_charge' with the identical or corresponding subscription amount.
- Auto-refund permission is granted for amounts up to $100.00 USD.
- Amounts exceeding $100.00 USD require Escalation to Tier 2 Billing Manager.

## 3. Resolution Steps
1. Query customer billing invoice history using `get_billing_invoices`.
2. Identify the duplicate charge transaction ID (e.g., INV-2025-002).
3. Execute the `issue_refund` tool with reason `Duplicate monthly billing charge`.
4. Inform customer that refunds take 3-5 business days to reflect on their card statement.
5. Provide the original valid invoice number and confirm active subscription status remains intact without interruption.
"""
    },
    {
        "article_code": "KB-BILL-002",
        "title": "Subscription Upgrade, Downgrade & Proration Guidelines",
        "category": "Subscription & Plans",
        "policy_reference": "POL-SUB-2024-03",
        "tags": ["upgrade", "downgrade", "proration", "pro", "enterprise", "plan change"],
        "action_permissions": ["upgrade_subscription_tier", "apply_billing_credit"],
        "summary": "Rules for upgrading or downgrading plans, pro-rated billing calculation, and feature unlocks.",
        "content": """# Subscription Upgrade & Plan Modification

## 1. Plan Types & Pricing
- **Free Tier**: $0/mo - 50 AI resolutions/month, Community support.
- **Pro Tier**: $49/mo - 2,500 AI resolutions/month, 99.9% SLA, Email support.
- **Enterprise Tier**: $299/mo - Unlimited resolutions, Dedicated account manager, 24/7 Phone & Slack SLA.

## 2. Proration Policy
- Upgrades take effect immediately with pro-rated billing applied to the difference.
- Downgrades take effect at the end of the current billing cycle to preserve paid usage.
- Customers requesting immediate cancellation with refund outside 14-day trial require Escalation.
"""
    },
    {
        "article_code": "KB-SEC-003",
        "title": "Account Access, 2FA / MFA Reset & Security Lockouts",
        "category": "Account & Security",
        "policy_reference": "POL-SEC-2025-04",
        "tags": ["2fa", "mfa", "locked out", "password reset", "security", "authenticator"],
        "action_permissions": ["send_password_reset_email", "reset_mfa_device"],
        "summary": "Verification protocols for resetting Multi-Factor Authentication (MFA) devices and password recovery.",
        "content": """# Account Access & MFA Reset Procedures

## 1. Security Guidelines
- Agents must never output passwords, full credit card numbers, or raw auth tokens in responses.
- MFA device resets require sending a secure verification email to the customer's registered email address.
- If customer reports unauthorized access or security breach, immediately escalate to Security Operations (SecOps) and flag account status as 'Investigation'.

## 2. Standard MFA Recovery Flow
1. Verify account registration email matches the active session.
2. Trigger `send_password_reset_email` or `reset_mfa_device`.
3. Inform customer that temporary backup recovery codes were dispatched to their primary email.
"""
    },
    {
        "article_code": "KB-TECH-004",
        "title": "API Rate Limits, 429 Too Many Requests & Quotas",
        "category": "Technical Support",
        "policy_reference": "POL-TECH-2025-02",
        "tags": ["api", "rate limit", "429", "timeout", "quota", "sdk", "headers"],
        "action_permissions": ["sync_api_quota", "apply_billing_credit"],
        "summary": "Troubleshooting 429 Too Many Requests errors, rate limit headers, and temporary quota expansion.",
        "content": """# API Rate Limits & Error 429 Troubleshooting

## 1. Rate Limit Specifications
- **Free Tier**: 20 requests/minute.
- **Pro Tier**: 120 requests/minute (Burst up to 200).
- **Enterprise Tier**: 1,000 requests/minute.

## 2. Response Headers
- `X-RateLimit-Limit`: Maximum allowed requests per window.
- `X-RateLimit-Remaining`: Remaining request count in active window.
- `X-RateLimit-Reset`: UTC epoch timestamp when the rate limit window resets.

## 3. Resolution Guidance
- Implement exponential backoff retry algorithms with jitter.
- Check if customer has reached their monthly plan cap.
- If customer is encountering unexpected 429 errors during high load, advise upgrading to Pro/Enterprise or request temporary quota buffer.
"""
    },
    {
        "article_code": "KB-BILL-005",
        "title": "High-Value Refund Exceptions & Escalation Matrix",
        "category": "Billing & Payments",
        "policy_reference": "POL-ESC-2025-09",
        "tags": ["escalation", "high value", "chargeback", "legal", "supervisor"],
        "action_permissions": [],
        "summary": "Mandatory human escalation rules for refunds over $100, legal threats, or account disputes.",
        "content": """# Escalation Protocol & Risk Management

## 1. Mandatory Escalation Triggers
The AI Agent MUST escalate the ticket to a human specialist when:
1. Refund requested exceeds $100.00 USD.
2. Customer mentions legal action, chargeback, or banking dispute.
3. Complex account ownership dispute or suspected identity fraud.
4. Sentiment analysis indicates extreme customer dissatisfaction or repeated unresolved inquiries.

## 2. Escalation Packet Format
When escalating, the AI must formulate an Escalation Packet including:
- Customer Code & Tier
- Summary of customer issue & frustration level
- Financial transactions involved & proposed refund amount
- Reason why human intervention is required
- Recommended department (L2 Billing, SecOps, Executive Care).
"""
    },
    {
        "article_code": "KB-GEN-006",
        "title": "Service Level Agreements (SLA) & Response Timelines",
        "category": "General Inquiry",
        "policy_reference": "POL-SLA-2025-01",
        "tags": ["sla", "support hours", "response time", "priority"],
        "action_permissions": [],
        "summary": "Guaranteed support response times categorized by ticket priority and customer tier.",
        "content": """# Support SLA & Resolution Timelines

## 1. Target Response Times
- **Urgent Priority (System Down / Financial Blocker)**: < 15 minutes.
- **High Priority (Major Feature Impaired / Duplicate Billing)**: < 1 hour.
- **Medium Priority (General Inquiry / Setup Assistance)**: < 4 hours.
- **Low Priority (Feature Request / Documentation clarification)**: < 24 hours.

## 2. Support Availability
- AI Agent System operates 24/7/365 with instantaneous triage and auto-resolution.
- Tier 2 Human Specialists operate 24/7 for Enterprise, and 8 AM - 8 PM EST for Pro/Free.
"""
    }
]
