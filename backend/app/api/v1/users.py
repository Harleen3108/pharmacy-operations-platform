from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.models import User, Role, Store
from app.core.security import get_password_hash
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role_id: int
    store_id: int
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None
    role_id: Optional[int] = None
    store_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserSchema(UserBase):
    id: int
    role_name: str
    store_name: str
    class Config:
        from_attributes = True

@router.get("", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for user in users:
        role = db.query(Role).filter(Role.id == user.role_id).first()
        store = db.query(Store).filter(Store.id == user.store_id).first()
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "role_id": user.role_id,
            "store_id": user.store_id,
            "is_active": user.is_active,
            "role_name": role.name if role else "N/A",
            "store_name": store.name if store else "N/A"
        }
        result.append(user_dict)
    return result

@router.post("", response_model=UserSchema)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role_id=user_data.role_id,
        store_id=user_data.store_id,
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        is_active=user_data.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    role = db.query(Role).filter(Role.id == db_user.role_id).first()
    store = db.query(Store).filter(Store.id == db_user.store_id).first()
    
    return {
        **db_user.__dict__,
        "role_name": role.name if role else "N/A",
        "store_name": store.name if store else "N/A"
    }

@router.patch("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    for var, value in user_data.model_dump(exclude_unset=True).items():
        if value is not None:
            if var == "password":
                setattr(db_user, "password_hash", get_password_hash(value))
            elif var == "username":
                # Check for uniqueness if username is changing
                if value != db_user.username:
                    existing = db.query(User).filter(User.username == value).first()
                    if existing:
                        raise HTTPException(status_code=400, detail="Username already in use")
                setattr(db_user, var, value)
            else:
                setattr(db_user, var, value)
            
    db.commit()
    db.refresh(db_user)
    
    role = db.query(Role).filter(Role.id == db_user.role_id).first()
    store = db.query(Store).filter(Store.id == db_user.store_id).first()
    
    return {
        **db_user.__dict__,
        "role_name": role.name if role else "N/A",
        "store_name": store.name if store else "N/A"
    }

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(db_user)
    db.commit()
    return {"status": "success", "message": "User permanently deleted"}
