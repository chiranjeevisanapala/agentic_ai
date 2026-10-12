from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.customer import Customer, Invoice
from app.schemas.customer import CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customer 360"])

@router.get("", response_model=List[CustomerResponse])
async def list_customers(db: AsyncSession = Depends(get_db)):
    stmt = select(Customer).options(selectinload(Customer.invoices)).order_by(Customer.created_at)
    res = await db.execute(stmt)
    customers = res.scalars().all()
    return [CustomerResponse.model_validate(c) for c in customers]

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Customer).where(Customer.id == customer_id).options(selectinload(Customer.invoices))
    res = await db.execute(stmt)
    customer = res.scalars().first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerResponse.model_validate(customer)
