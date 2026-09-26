from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import auth, crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.AuthResponse)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(crud.models.User).filter(crud.models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        is_online=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return schemas.AuthResponse(access_token=auth.create_access_token(user.id), user=user)


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(crud.models.User).filter(crud.models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return schemas.AuthResponse(access_token=auth.create_access_token(user.id), user=user)


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(current_user=Depends(auth.get_current_user)):
    return current_user