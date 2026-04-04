from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Product, Batch, Inventory
from pydantic import BaseModel
from datetime import date

router = APIRouter()

class BatchSchema(BaseModel):
    id: int
    batch_number: str
    expiry_date: date
    selling_price: float
    current_quantity: int
    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: int
    name: str
    generic_name: Optional[str]
    category: Optional[str]
    is_prescription_required: bool
    stock_level: Optional[int] = 0
    batches: List[BatchSchema] = []
    class Config:
        from_attributes = True

class BatchCreate(BaseModel):
    inventory_id: int
    batch_number: str
    expiry_date: date
    cost_price: float
    selling_price: float
    quantity: int

@router.get("/search", response_model=List[ProductSchema])
def search_products(query: Optional[str] = None, db: Session = Depends(get_db)):
    db_query = db.query(Product)
    if query:
        db_query = db_query.filter(
            (Product.name.ilike(f"%{query}%")) | 
            (Product.generic_name.ilike(f"%{query}%")) |
            (Product.category.ilike(f"%{query}%"))
        )
    
    products = db_query.all()
    
    # Calculate stock level and fetch batches
    result = []
    for p in products:
        inv = db.query(Inventory).filter(Inventory.product_id == p.id).first()
        batches = []
        stock_level = 0
        if inv:
            batches = db.query(Batch).filter(Batch.inventory_id == inv.id).all()
            stock_level = sum(b.current_quantity for b in batches)
            
        p_dict = {
            "id": p.id,
            "name": p.name,
            "generic_name": p.generic_name,
            "category": p.category,
            "is_prescription_required": p.is_prescription_required,
            "stock_level": stock_level,
            "batches": batches
        }
        result.append(p_dict)
        
    return result

@router.get("/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    
    inv = db.query(Inventory).filter(Inventory.product_id == p.id).first()
    batches = []
    stock_level = 0
    if inv:
        batches = db.query(Batch).filter(Batch.inventory_id == inv.id).all()
        stock_level = sum(b.current_quantity for b in batches)
        
    return {
        "id": p.id,
        "name": p.name,
        "generic_name": p.generic_name,
        "category": p.category,
        "is_prescription_required": p.is_prescription_required,
        "stock_level": stock_level,
        "batches": batches
    }

@router.post("/batch", response_model=BatchSchema)
def add_batch(batch_data: BatchCreate, db: Session = Depends(get_db)):
    db_batch = Batch(
        inventory_id=batch_data.inventory_id,
        batch_number=batch_data.batch_number,
        expiry_date=batch_data.expiry_date,
        cost_price=batch_data.cost_price,
        selling_price=batch_data.selling_price,
        initial_quantity=batch_data.quantity,
        current_quantity=batch_data.quantity
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@router.patch("/batch/{batch_id}")
def update_batch_stock(batch_id: int, quantity: int, db: Session = Depends(get_db)):
    db_batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not db_batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    db_batch.current_quantity = quantity
    db.commit()
    db.refresh(db_batch)
    return {"status": "success", "new_quantity": db_batch.current_quantity}
