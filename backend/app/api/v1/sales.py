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
    customer_name: Optional[str] = None
    customer_mobile: Optional[str] = None
    payment_method: str = "cash"
    prescription_id: Optional[int] = None

class SaleHistoryResponse(BaseModel):
    id: int
    transaction_id: str
    customer_name: Optional[str]
    customer_mobile: Optional[str]
    payment_method: str
    total_amount: float
    status: str
    created_at: datetime
    store_name: str

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: int
    status: str
    transaction_id: str
    timestamp: datetime

@router.get("/", response_model=List[SaleHistoryResponse])
def get_sales_history(store_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Sale)
    if store_id:
        query = query.filter(Sale.store_id == store_id)
    sales = query.order_by(Sale.created_at.desc()).all()
    
    response = []
    for s in sales:
        response.append({
            "id": s.id,
            "transaction_id": f"TXN-{s.id:06}-{s.created_at.strftime('%Y%m%d')}",
            "customer_name": s.customer_name,
            "customer_mobile": s.customer_mobile,
            "payment_method": s.payment_method,
            "total_amount": float(s.total_amount),
            "status": s.status,
            "created_at": s.created_at,
            "store_name": s.store.name if s.store else "Unknown Store"
        })
    return response

@router.post("/create", response_model=SaleResponse)
def create_sale(sale_data: SaleCreate, db: Session = Depends(get_db)):
    # 1. Create Sale record
    new_sale = Sale(
        store_id=sale_data.store_id,
        associate_id=sale_data.associate_id,
        total_amount=sale_data.total_amount,
        customer_name=sale_data.customer_name,
        customer_mobile=sale_data.customer_mobile,
        payment_method=sale_data.payment_method,
        status="completed"
    )
    db.add(new_sale)
    db.flush() 

    # 2. Process items and update stock
    for item in sale_data.items:
        # Check if batch belongs to the store
        batch = db.query(Batch).join(Inventory).filter(
            Batch.id == item.batch_id,
            Inventory.store_id == sale_data.store_id
        ).first()

        if not batch:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Batch {item.batch_id} not found in this store")
            
        if batch.current_quantity < item.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for batch {item.batch_id}. Available: {batch.current_quantity}")
        
        # Reduce Stock
        batch.current_quantity -= item.quantity
        
        sale_item = SaleItem(
            sale_id=new_sale.id,
            batch_id=batch.id,
            quantity=item.quantity,
            unit_price=batch.selling_price,
            subtotal=float(batch.selling_price) * item.quantity
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

    # Staff Activity
    staff_activity = []
    if sales_today:
        from app.models.models import User
        activity_data = db.query(
            User.full_name,
            func.count(Sale.id).label('transactions'),
            func.sum(Sale.total_amount).label('total_volume')
        ).join(Sale, Sale.associate_id == User.id).filter(
            Sale.id.in_([s.id for s in sales_today])
        ).group_by(User.full_name).all()
        
        for name, count, volume in activity_data:
            staff_activity.append({
                "name": name,
                "transactions": count,
                "volume": float(volume)
            })

    return {
        "total_sales": float(total_amount),
        "total_transactions": total_transactions,
        "top_product": top_product,
        "prescription_sales": 0,
        "staff_activity": staff_activity
    }
