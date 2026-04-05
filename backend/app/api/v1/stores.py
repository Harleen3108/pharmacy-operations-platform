from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.db.session import get_db
from app.models.models import Store, Sale, User
from pydantic import BaseModel
from datetime import date, datetime

router = APIRouter()

class StoreBase(BaseModel):
    name: str
    location: str
    contact_number: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class StoreSchema(StoreBase):
    id: int
    class Config:
        from_attributes = True

class StorePerformance(BaseModel):
    id: int
    name: str
    location: str
    total_sales: float
    transaction_count: int
    staff_count: int
    status: str # "online" | "offline"
    performance_level: str # "High" | "Average" | "Low"

@router.get("", response_model=List[StoreSchema])
def get_stores(db: Session = Depends(get_db)):
    return db.query(Store).all()

@router.post("", response_model=StoreSchema)
def create_store(store_in: StoreCreate, db: Session = Depends(get_db)):
    if db.query(Store).filter(Store.name == store_in.name).first():
        raise HTTPException(status_code=400, detail="Store name already exists")
    
    new_store = Store(**store_in.model_dump())
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return new_store

@router.get("/stats", response_model=List[StorePerformance])
def get_store_stats(db: Session = Depends(get_db)):
    stores = db.query(Store).all()
    results = []
    
    for s in stores:
        # Aggregate Sales
        sales_data = db.query(
            func.sum(Sale.total_amount).label('total'),
            func.count(Sale.id).label('count')
        ).filter(Sale.store_id == s.id).first()
        
        # Count Staff
        staff_count = db.query(User).filter(User.store_id == s.id).count()
        
        total_val = float(sales_data.total or 0)
        count_val = int(sales_data.count or 0)
        
        # Determine Performance Level (Simple Logic)
        perf = "Average"
        if total_val > 5000: perf = "High"
        elif total_val < 1000: perf = "Low"
        
        results.append({
            "id": s.id,
            "name": s.name,
            "location": s.location,
            "total_sales": total_val,
            "transaction_count": count_val,
            "staff_count": staff_count,
            "status": "online", # Default as they are active and listed
            "performance_level": perf
        })
    
    return results
