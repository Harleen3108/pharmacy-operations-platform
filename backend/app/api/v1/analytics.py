from fastapi import APIRouter, Depends
from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.db.session import get_db
from app.models.models import Sale, Batch, Store, Inventory
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/sales-trends")
def get_sales_trends(db: Session = Depends(get_db)):
    # Get last 7 days of sales
    seven_days_ago = datetime.now() - timedelta(days=7)
    
    trends = db.query(
        func.date(Sale.created_at).label('date'),
        func.sum(Sale.total_amount).label('amount'),
        func.count(Sale.id).label('transactions')
    ).filter(Sale.created_at >= seven_days_ago)\
     .group_by(func.date(Sale.created_at))\
     .order_by(func.date(Sale.created_at)).all()
    
    return [
        {"date": str(t.date), "amount": float(t.amount), "transactions": t.transactions}
        for t in trends
    ]

@router.get("/stock-health")
def get_stock_health(db: Session = Depends(get_db)):
    today = datetime.now().date()
    thirty_days_from_now = today + timedelta(days=30)
    
    expiring_soon = db.query(Batch).filter(
        Batch.expiry_date > today,
        Batch.expiry_date <= thirty_days_from_now
    ).count()
    
    already_expired = db.query(Batch).filter(
        Batch.expiry_date <= today
    ).count()
    
    # Low stock logic relative to reorder_level
    low_stock = db.query(Inventory).join(Batch).group_by(Inventory.id).having(
        func.sum(Batch.current_quantity) <= Inventory.reorder_level
    ).count()
    
    return {
        "expiring_soon": expiring_soon,
        "already_expired": already_expired,
        "low_stock": low_stock,
        "out_of_stock": 0 # Simplified for now
    }

@router.get("/top-performing-stores")
def get_top_performing_stores(db: Session = Depends(get_db)):
    performance = db.query(
        Store.name.label('store'),
        func.sum(Sale.total_amount).label('sales')
    ).join(Sale, Sale.store_id == Store.id)\
     .group_by(Store.id)\
     .order_by(func.sum(Sale.total_amount).desc()).limit(5).all()
    
    return [
        {"store": p.store, "sales": float(p.sales), "profit": float(p.sales) * 0.25} # Assuming 25% margin
        for p in performance
    ]
