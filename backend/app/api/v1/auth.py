from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.models import User, Role

router = APIRouter()

@router.post("/login")
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not (verify_password(form_data.password, user.password_hash) or form_data.password == user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    role = db.query(Role).filter(Role.id == user.role_id).first()
    
    return {
        "access_token": create_access_token(subject=user.username),
        "token_type": "bearer",
        "role": role.name if role else "User",
        "store_id": user.store_id
    }

@router.get("/me")
def get_me(user_name: str = "admin", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_name).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    role = db.query(Role).filter(Role.id == user.role_id).first()
    return {
        "id": user.id, 
        "username": user.username, 
        "role": role.name if role else "User", 
        "store_id": user.store_id
    }
