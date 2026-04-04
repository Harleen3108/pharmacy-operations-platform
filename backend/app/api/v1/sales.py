from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import Sale, SaleItem, Batch, Product, Inventory
from pydantic import BaseModel
from datetime import datetime, date

router = APIRouter()

class SaleItemCreate(BaseModel):
    batch_id: int
    quantity: int
    unit_price: float

class SaleCreate(BaseModel):
    store_id: int
    associate_id: int
    items: List[SaleItemCreate]
    total_amount: float
    payment_method: str = "cash"
    prescription_id: Optional[int] = None

class SaleResponse(BaseModel):
    id: int
    status: str
    transaction_id: str
    timestamp: datetime

@router.post("/create", response_model=SaleResponse)
def create_sale(sale_data: SaleCreate, db: Session = Depends(get_db)):
    # 1. Create Sale record
    new_sale = Sale(
        store_id=sale_data.store_id,
        associate_id=sale_data.associate_id,
        total_amount=sale_data.total_amount,
        status="completed"
    )
    db.add(new_sale)
    db.flush() # Get new_sale.id

    # 2. Process items and update stock
    for item in sale_data.items:
        batch = db.query(Batch).filter(Batch.id == item.batch_id).first()
        if not batch or batch.current_quantity < item.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for batch {item.batch_id}")
        
        # Decrement stock
        batch.current_quantity -= item.quantity
        
        # Create SaleItem
        sale_item = SaleItem(
            sale_id=new_sale.id,
            batch_id=batch.id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.quantity * item.unit_price
        )
        db.add(sale_item)

    db.commit()
    db.refresh(new_sale)

    return {
        "id": new_sale.id,
        "status": new_sale.status,
        "transaction_id": f"TXN-{new_sale.id:06}-{datetime.now().strftime('%Y%m%d')}",
        "timestamp": new_sale.created_at
    }

@router.get("/daily-summary")
def get_daily_summary(store_id: int, db: Session = Depends(get_db)):
    today = date.today()
    sales_today = db.query(Sale).filter(
        Sale.store_id == store_id,
        func.date(Sale.created_at) == today
    ).all()

    total_amount = sum(s.total_amount for s in sales_today)
    total_transactions = len(sales_today)
    
    # Simple top product logic for now
    top_product = "N/A"
    if sales_today:
        sale_ids = [s.id for s in sales_today]
        top_item = db.query(
            Batch.inventory_id, func.sum(SaleItem.quantity).label('total_qty')
        ).join(SaleItem, SaleItem.batch_id == Batch.id).filter(
            SaleItem.sale_id.in_(sale_ids)
        ).group_by(Batch.inventory_id).order_by(func.sum(SaleItem.quantity).desc()).first()
        
        if top_item:
            inv = db.query(Inventory).filter(Inventory.id == top_item.inventory_id).first()
            if inv:
                prod = db.query(Product).filter(Product.id == inv.product_id).first()
                top_product = prod.name if prod else "N/A"

    return {
        "total_sales": float(total_amount),
        "total_transactions": total_transactions,
        "top_product": top_product,
        "prescription_sales": 0 # Placeholder for now
    }
