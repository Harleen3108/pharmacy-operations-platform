from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.db.session import get_db
from app.models.models import Prescription, User

router = APIRouter()

class PrescriptionBase(BaseModel):
    patient_name: str
    rx_number: str
    medicines: List[dict]
    type: str = "standard"
    store_id: int

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionResponse(PrescriptionBase):
    id: int
    status: str
    compliance_flags: dict
    created_at: datetime
    validated_at: Optional[datetime] = None
    pharmacist_id: Optional[int] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PrescriptionResponse])
def get_prescriptions(status: Optional[str] = "pending", store_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Prescription)
    if status:
        query = query.filter(Prescription.status == status)
    if store_id:
        query = query.filter(Prescription.store_id == store_id)
    return query.order_by(desc(Prescription.created_at)).all()

@router.post("/", response_model=PrescriptionResponse)
def create_prescription(rx: PrescriptionCreate, db: Session = Depends(get_db)):
    new_rx = Prescription(**rx.dict())
    db.add(new_rx)
    db.commit()
    db.refresh(new_rx)
    return new_rx

@router.patch("/{id}/validate", response_model=PrescriptionResponse)
def validate_prescription(id: int, pharmacist_id: int, db: Session = Depends(get_db)):
    rx = db.query(Prescription).filter(Prescription.id == id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    rx.status = "validated"
    rx.pharmacist_id = pharmacist_id
    rx.validated_at = datetime.now()
    db.commit()
    db.refresh(rx)
    return rx

@router.patch("/{id}/reject", response_model=PrescriptionResponse)
def reject_prescription(id: int, db: Session = Depends(get_db)):
    rx = db.query(Prescription).filter(Prescription.id == id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    rx.status = "rejected"
    db.commit()
    db.refresh(rx)
    return rx
