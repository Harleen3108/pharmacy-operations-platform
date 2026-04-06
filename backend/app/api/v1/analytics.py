from fastapi import APIRouter, Depends
from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.db.session import get_db
from app.models.models import Sale, Batch, Store, Inventory
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/sales-trends")
def get_sales_trends(store_id: int = None, db: Session = Depends(get_db)):
    # Get last 7 days of sales
    seven_days_ago = datetime.now() - timedelta(days=7)
    
    query = db.query(
        func.date(Sale.created_at).label('date'),
        func.sum(Sale.total_amount).label('amount'),
        func.count(Sale.id).label('transactions')
    ).filter(Sale.created_at >= seven_days_ago)
    
    if store_id:
        query = query.filter(Sale.store_id == store_id)
        
    trends = query.group_by(func.date(Sale.created_at))\
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

@router.get("/district-summary")
def get_district_summary(days: int = 1, db: Session = Depends(get_db)):
    now = datetime.now()
    current_start = now - timedelta(days=days)
    previous_start = now - timedelta(days=days * 2)
    
    # Current Period Stats
    current_sales = db.query(func.sum(Sale.total_amount)).filter(Sale.created_at >= current_start).scalar() or 0
    current_count = db.query(func.count(Sale.id)).filter(Sale.created_at >= current_start).scalar() or 0
    
    # Current Cost (for real margin)
    current_cost = db.query(func.sum(SaleItem.quantity * Batch.cost_price))\
        .join(Sale, SaleItem.sale_id == Sale.id)\
        .join(Batch, SaleItem.batch_id == Batch.id)\
        .filter(Sale.created_at >= current_start).scalar() or 0
        
    current_margin = ((float(current_sales) - float(current_cost)) / float(current_sales) * 100) if current_sales > 0 else 0
    
    # Previous Period Stats (for trends)
    prev_sales = db.query(func.sum(Sale.total_amount)).filter(
        Sale.created_at >= previous_start, 
        Sale.created_at < current_start
    ).scalar() or 0
    
    # Trend Calculation
    sales_change = ((float(current_sales) - float(prev_sales)) / float(prev_sales) * 100) if prev_sales > 0 else 0
    
    # Store-wise Performance
    performance = db.query(
        Store.name.label('name'),
        func.sum(Sale.total_amount).label('sales'),
        func.count(Sale.id).label('transactions'),
        func.sum(SaleItem.quantity * Batch.cost_price).label('cost')
    ).join(Sale, Sale.store_id == Store.id)\
     .join(SaleItem, SaleItem.sale_id == Sale.id)\
     .join(Batch, SaleItem.batch_id == Batch.id)\
     .filter(Sale.created_at >= current_start)\
     .group_by(Store.id).all()
    
    store_performance = [
        {
            "name": p.name, 
            "sales": float(p.sales), 
            "transactions": p.transactions,
            "margin": round(((float(p.sales) - float(p.cost)) / float(p.sales) * 100), 1) if p.sales > 0 else 0
        }
        for p in performance
    ]
    
    return {
        "total_sales": float(current_sales),
        "sales_change": round(sales_change, 1),
        "total_dispensing": current_count,
        "dispensing_change": 0, # Simplified
        "avg_margin": round(current_margin, 1),
        "margin_change": 0, # Simplified
        "store_performance": store_performance
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
        {"store": p.store, "sales": float(p.sales), "profit": float(p.sales) * 0.25}
        for p in performance
    ]
