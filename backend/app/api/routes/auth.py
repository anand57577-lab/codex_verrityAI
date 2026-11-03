from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    get_jwt_secret_key,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.models.organization import Organization, Brand
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    get_jwt_secret_key()
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    try:
        user = User(
            full_name=payload.full_name,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )
        db.add(user)
        db.flush()

        organization = Organization(
            legal_name=payload.organization_name,
            industry=payload.industry,
            country_market=payload.country_market,
            description=payload.description,
            owner_user_id=user.id,
        )
        db.add(organization)
        db.flush()

        brand = Brand(
            organization_id=organization.id,
            name=payload.primary_brand_name,
        )
        db.add(brand)
        db.commit()
        db.refresh(user)

        return AuthResponse(
            access_token=create_access_token(user.id),
            user=UserResponse(id=user.id, full_name=user.full_name, email=user.email),
        )
    except Exception:
        db.rollback()
        raise

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    get_jwt_secret_key()
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account is disabled.")

    return AuthResponse(
        access_token=create_access_token(user.id),
        user=UserResponse(id=user.id, full_name=user.full_name, email=user.email),
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
    )
