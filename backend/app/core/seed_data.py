import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserRole
from app.models.customer import Customer, Invoice
from app.models.knowledge import KnowledgeArticle
from app.rag.knowledge_base import SUPPORT_KNOWLEDGE_DOCUMENTS
from app.core.security import get_password_hash

async def seed_initial_data(db: AsyncSession):
    """Populates database with sample users, customers, duplicate invoices, and knowledge base articles."""
    
    # 1. Check if customers already exist
    res = await db.execute(select(Customer).limit(1))
    if res.scalars().first() is not None:
        return # Already seeded

    # Seed Admin / Agent / Customer Users
    admin_user = User(
        id=str(uuid.uuid4()),
        email="admin@support.ai",
        hashed_password=get_password_hash("admin123"),
        full_name="Sarah Jenkins (Admin)",
        role=UserRole.ADMIN.value
    )
    agent_user = User(
        id=str(uuid.uuid4()),
        email="agent@support.ai",
        hashed_password=get_password_hash("agent123"),
        full_name="David Miller (Support Agent)",
        role=UserRole.AGENT.value
    )
    customer_user = User(
        id=str(uuid.uuid4()),
        email="alex.rivera@techcorp.io",
        hashed_password=get_password_hash("customer123"),
        full_name="Alex Rivera",
        role=UserRole.CUSTOMER.value
    )
    db.add(admin_user)
    db.add(agent_user)
    db.add(customer_user)

    # Seed Demo Customer 1 (Alex Rivera - Pro Tier, with Duplicate Billing Charge Scenario)
    now = datetime.utcnow()
    cust_1 = Customer(
        id=str(uuid.uuid4()),
        user_id=customer_user.id,
        customer_code="CUST-10492",
        name="Alex Rivera",
        email="alex.rivera@techcorp.io",
        company="TechCorp Solutions",
        subscription_tier="Pro",
        subscription_status="active",
        monthly_rate=49.0,
        current_balance=0.0,
        renewal_date=now + timedelta(days=23),
        payment_method="Visa ending in 4242",
        mfa_enabled="Enabled (TOTP)",
        metadata_json={"preferred_language": "en", "signup_source": "ProductHunt"}
    )
    db.add(cust_1)

    # Invoices for Customer 1 (Contains duplicate charge for current month)
    inv_1_primary = Invoice(
        id=str(uuid.uuid4()),
        customer_id=cust_1.id,
        invoice_number="INV-2025-001",
        amount=49.0,
        currency="USD",
        status="paid",
        description="Pro Monthly Subscription (Oct 2025 - Nov 2025)",
        billing_date=now - timedelta(days=3),
        paid_at=now - timedelta(days=3),
        pdf_url="/receipts/inv-2025-001.pdf"
    )
    inv_1_duplicate = Invoice(
        id=str(uuid.uuid4()),
        customer_id=cust_1.id,
        invoice_number="INV-2025-002",
        amount=49.0,
        currency="USD",
        status="duplicate_charge", # duplicate charge to be refunded!
        description="Pro Monthly Subscription (Duplicate automated renewal)",
        billing_date=now - timedelta(days=2),
        paid_at=now - timedelta(days=2),
        pdf_url="/receipts/inv-2025-002.pdf"
    )
    inv_1_prior = Invoice(
        id=str(uuid.uuid4()),
        customer_id=cust_1.id,
        invoice_number="INV-2024-098",
        amount=49.0,
        currency="USD",
        status="paid",
        description="Pro Monthly Subscription (Sep 2025 - Oct 2025)",
        billing_date=now - timedelta(days=33),
        paid_at=now - timedelta(days=33),
        pdf_url="/receipts/inv-2024-098.pdf"
    )
    db.add(inv_1_primary)
    db.add(inv_1_duplicate)
    db.add(inv_1_prior)

    # Seed Demo Customer 2 (Elena Vance - Enterprise Tier, High Value Refund / Escalation Persona)
    cust_2 = Customer(
        id=str(uuid.uuid4()),
        user_id=None,
        customer_code="CUST-88301",
        name="Elena Vance",
        email="elena.vance@blackmesa.org",
        company="Black Mesa Research",
        subscription_tier="Enterprise",
        subscription_status="active",
        monthly_rate=299.0,
        current_balance=0.0,
        renewal_date=now + timedelta(days=12),
        payment_method="Mastercard ending in 8831",
        mfa_enabled="Enabled (Hardware Key)",
        metadata_json={"sla": "24/7 Priority", "account_rep": "David Miller"}
    )
    db.add(cust_2)

    inv_2_enterprise = Invoice(
        id=str(uuid.uuid4()),
        customer_id=cust_2.id,
        invoice_number="INV-2025-045",
        amount=299.0,
        currency="USD",
        status="duplicate_charge", # > $100 -> Triggers Escalation Agent!
        description="Enterprise Subscription Monthly Renewal",
        billing_date=now - timedelta(days=1),
        paid_at=now - timedelta(days=1)
    )
    db.add(inv_2_enterprise)

    # Seed Demo Customer 3 (Marcus Chen - Free Tier Developer)
    cust_3 = Customer(
        id=str(uuid.uuid4()),
        user_id=None,
        customer_code="CUST-33109",
        name="Marcus Chen",
        email="marcus.chen@devflow.io",
        company="DevFlow OpenSource",
        subscription_tier="Free",
        subscription_status="active",
        monthly_rate=0.0,
        current_balance=0.0,
        renewal_date=None,
        payment_method="None",
        mfa_enabled="Disabled",
        metadata_json={"github_user": "mchen_dev"}
    )
    db.add(cust_3)

    # Seed Knowledge Articles
    for doc in SUPPORT_KNOWLEDGE_DOCUMENTS:
        kb_entry = KnowledgeArticle(
            id=str(uuid.uuid4()),
            article_code=doc["article_code"],
            title=doc["title"],
            category=doc["category"],
            content=doc["content"],
            summary=doc.get("summary"),
            tags=doc.get("tags", []),
            policy_reference=doc.get("policy_reference"),
            action_permissions=doc.get("action_permissions", [])
        )
        db.add(kb_entry)

    await db.commit()
