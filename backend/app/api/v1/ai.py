from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import Product, Batch, Inventory, Sale, PurchaseOrder
import random

router = APIRouter()

class AIQuery(BaseModel):
    query: str
    store_id: Optional[int] = None

class AIResponse(BaseModel):
    answer: str
    action_suggested: Optional[str] = None
    data: Optional[dict] = None

class ReorderRequest(BaseModel):
    inventory_id: int
    quantity: int

@router.post("/query", response_model=AIResponse)
def query_ai_assistant(query: AIQuery, db: Session = Depends(get_db)):
    # Mocking LLM logic with DB facts
    low_stock_count = db.query(Inventory).join(Batch).group_by(Inventory.id).having(
        func.sum(Batch.current_quantity) <= Inventory.reorder_level
    ).count()
    
    responses = [
        f"I've detected {low_stock_count} items with low stock levels. We recommend a replenishment order.",
        "Sales trends are positive for this week, with a 12% increase in respiratory meds.",
         "Inventory health is stable, but 3 batches are approaching expiry in the next 30 days."
    ]
    
    return {
        "answer": random.choice(responses),
        "action_suggested": "Review replenishment suggestions?",
        "data": {"low_stock_items": low_stock_count, "confidence": 0.92}
    }

@router.post("/apply-reorder")
def apply_reorder_suggestion(request: ReorderRequest, db: Session = Depends(get_db)):
    db_po = PurchaseOrder(
        inventory_id=request.inventory_id,
        quantity_suggested=request.quantity,
        status="pending",
        source="AI_SUGGESTION"
    )
    db.add(db_po)
    db.commit()
    db.refresh(db_po)
    return {"status": "success", "order_id": db_po.id}

@router.get("/forecast")
def get_demand_forecast(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    current_stock = 0
    if inv:
        current_stock = db.query(func.sum(Batch.current_quantity)).filter(Batch.inventory_id == inv.id).scalar() or 0
        
    return {
        "product_id": product_id,
        "product_name": product.name,
        "forecasted_demand": current_stock + 50, # Simple mock forecast
        "current_stock": current_stock,
        "recommendation": f"Add {50} units to safety stock"
    }

@router.get("/anomalies")
def detect_anomalies():
    return [
        {"id": 1, "type": "Stock Lag", "description": "Lisinopril inventory not moving in Branch 041", "severity": "Medium"},
        {"id": 2, "type": "Expiry Risk", "description": "Batch B-AMX-500-02 expires in 28 days", "severity": "High"}
    ]
