from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import StockTransfer, Store, Product
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class TransferCreate(BaseModel):
    product_id: int
    from_store_id: int
    to_store_id: int
    quantity: int

class TransferResponse(BaseModel):
    id: int
    product_name: str
    from_store_name: str
    to_store_name: str
    quantity: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TransferResponse])
def get_transfers(store_id: int, db: Session = Depends(get_db)):
    # Returns transfers where the store is either sender or receiver
    transfers = db.query(StockTransfer).filter(
        (StockTransfer.from_store_id == store_id) | 
        (StockTransfer.to_store_id == store_id)
    ).order_by(StockTransfer.created_at.desc()).all()
    
    result = []
    for t in transfers:
        result.append({
            "id": t.id,
            "product_name": t.product.name if t.product else "Unknown",
            "from_store_name": t.from_store.name if t.from_store else "Unknown",
            "to_store_name": t.to_store.name if t.to_store else "Unknown",
            "quantity": t.quantity,
            "status": t.status,
            "created_at": t.created_at
        })
    return result

@router.post("/", response_model=TransferResponse)
def create_transfer(transfer_data: TransferCreate, db: Session = Depends(get_db)):
    new_transfer = StockTransfer(
        product_id=transfer_data.product_id,
        from_store_id=transfer_data.from_store_id,
        to_store_id=transfer_data.to_store_id,
        quantity=transfer_data.quantity,
        status="pending"
    )
    db.add(new_transfer)
    db.commit()
    db.refresh(new_transfer)
    
    return {
        "id": new_transfer.id,
        "product_name": new_transfer.product.name,
        "from_store_name": new_transfer.from_store.name,
        "to_store_name": new_transfer.to_store.name,
        "quantity": new_transfer.quantity,
        "status": new_transfer.status,
        "created_at": new_transfer.created_at
    }

@router.patch("/{transfer_id}/")
def update_transfer_status(transfer_id: int, status: str, db: Session = Depends(get_db)):
    transfer = db.query(StockTransfer).filter(StockTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    transfer.status = status
    db.commit()
    return {"message": f"Transfer status updated to {status}"}
