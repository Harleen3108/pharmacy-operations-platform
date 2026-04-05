from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import Role
from pydantic import BaseModel

router = APIRouter()

class RoleSchema(BaseModel):
    id: int
    name: str
    description: str
    class Config:
        from_attributes = True

@router.get("", response_model=List[RoleSchema])
def get_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()
