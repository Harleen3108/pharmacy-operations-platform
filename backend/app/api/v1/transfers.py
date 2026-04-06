from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import StockTransfer, Store, Product, Inventory, Batch
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
    
    # Eagerly fetch for response
    product = db.query(Product).filter(Product.id == new_transfer.product_id).first()
    from_store = db.query(Store).filter(Store.id == new_transfer.from_store_id).first()
    to_store = db.query(Store).filter(Store.id == new_transfer.to_store_id).first()
    
    return {
        "id": new_transfer.id,
        "product_name": product.name if product else "Unknown",
        "from_store_name": from_store.name if from_store else "Unknown",
        "to_store_name": to_store.name if to_store else "Unknown",
        "quantity": new_transfer.quantity,
        "status": new_transfer.status,
        "created_at": new_transfer.created_at
    }

@router.patch("/{transfer_id}/")
def update_transfer_status(transfer_id: int, status: str, db: Session = Depends(get_db)):
    transfer = db.query(StockTransfer).filter(StockTransfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    # Inventory Adjustment Logic
    if status == "approved" and transfer.status == "pending":
        # Subtract from SENDER
        inventory = db.query(Inventory).filter(
            Inventory.product_id == transfer.product_id,
            Inventory.store_id == transfer.from_store_id
        ).first()
        
        if not inventory:
            raise HTTPException(status_code=400, detail="Sender has no inventory for this product")
            
        batches = db.query(Batch).filter(
            Batch.inventory_id == inventory.id,
            Batch.current_quantity > 0
        ).order_by(Batch.expiry_date.asc()).all()
        
        total_available = sum(b.current_quantity for b in batches)
        if total_available < transfer.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock in sender store")
            
        remaining_to_deduct = transfer.quantity
        for b in batches:
            if remaining_to_deduct <= 0:
                break
            deduct = min(b.current_quantity, remaining_to_deduct)
            b.current_quantity -= deduct
            remaining_to_deduct -= deduct
            
    elif status == "received" and transfer.status == "approved":
        # Add to RECEIVER
        inventory = db.query(Inventory).filter(
            Inventory.product_id == transfer.product_id,
            Inventory.store_id == transfer.to_store_id
        ).first()
        
        if not inventory:
            # Create inventory record if it doesn't exist
            inventory = Inventory(
                product_id=transfer.product_id,
                store_id=transfer.to_store_id,
                reorder_level=10
            )
            db.add(inventory)
            db.flush()
            
        # For simplicity, we create a new "Transferred" batch or add to an existing placeholder
        # In a real system, we'd transfer the specific batch ID
        existing_batch = db.query(Batch).filter(
            Batch.inventory_id == inventory.id,
            Batch.batch_number == "TRANSFERRED"
        ).first()
        
        if existing_batch:
            existing_batch.current_quantity += transfer.quantity
        else:
            new_batch = Batch(
                inventory_id=inventory.id,
                batch_number="TRANSFERRED",
                expiry_date=datetime.now().date(), # Placeholder - ideally from source batch
                cost_price=0.0,
                selling_price=0.0,
                initial_quantity=transfer.quantity,
                current_quantity=transfer.quantity
            )
            db.add(new_batch)
            
    transfer.status = status
    db.commit()
    return {"message": f"Transfer status updated to {status}", "id": transfer.id}
