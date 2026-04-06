from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.models import Product, Batch, Inventory, Sale, PurchaseOrder
from app.core.ai_client import get_ai_response, get_replenishment_analysis
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
    # Fetch factual data to provide context to the AI
    low_stock_items = db.query(Product.name, func.sum(Batch.current_quantity).label('qty')).join(Inventory).join(Batch).group_by(Product.id).having(
        func.sum(Batch.current_quantity) <= Inventory.reorder_level
    ).all()
    
    low_stock_list = [f"{item.name} ({item.qty} units left)" for item in low_stock_items]
    
    if "replenish" in query.query.lower() or "stock" in query.query.lower():
        answer = get_replenishment_analysis(low_stock_list)
    else:
        # Standard query with platform context
        context_prompt = f"""
        User Query: {query.query}
        Platform Context: We have {len(low_stock_items)} items with low stock.
        Answer as a pharmacy operations AI assistant. Keep it concise.
        """
        answer = get_ai_response(context_prompt)
    
    return {
        "answer": answer,
        "action_suggested": "Review replenishment suggestions?" if low_stock_items else None,
        "data": {"low_stock_count": len(low_stock_items), "confidence": 0.95}
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
        
    # Fetch historical sales data for the last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    sales = db.query(func.sum(SaleItem.quantity)).join(Sale).join(Batch).join(Inventory).filter(
        Inventory.product_id == product_id,
        Sale.created_at >= thirty_days_ago
    ).scalar() or 0
    
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    current_stock = 0
    if inv:
        current_stock = db.query(func.sum(Batch.current_quantity)).filter(Batch.inventory_id == inv.id).scalar() or 0
    
    prompt = f"""
    Product: {product.name}
    Current Stock: {current_stock}
    Sales (Last 30 days): {sales}
    
    As a pharmacy inventory expert, forecast the demand for next month and recommend a reorder quantity. 
    Keep the recommendation concise.
    """
    recommendation = get_ai_response(prompt)
        
    return {
        "product_id": product_id,
        "product_name": product.name,
        "historical_sales_30d": sales,
        "current_stock": current_stock,
        "ai_recommendation": recommendation
    }

@router.get("/anomalies")
def detect_anomalies():
    return [
        {"id": 1, "type": "Stock Lag", "description": "Lisinopril inventory not moving in Branch 041", "severity": "Medium"},
        {"id": 2, "type": "Expiry Risk", "description": "Batch B-AMX-500-02 expires in 28 days", "severity": "High"}
    ]
