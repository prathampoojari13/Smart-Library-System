from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.utils.security import create_access_token
from app.utils.password import hash_password, verify_password
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =====================================
# Register User (Public - always creates student)
# =====================================

@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Security: public registration is strictly student role
    assigned_role = "student"

    new_user = User(
        name=user.name.strip(),
        email=user.email.strip().lower(),
        password=hash_password(user.password),
        role=assigned_role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =====================================
# Get Current User Profile
# =====================================

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = db.query(User).filter(
        User.user_id == current_user["user_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =====================================
# Login User with JWT
# =====================================

@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Incorrect password"
        )

    access_token = create_access_token(
        data={
            "user_id": existing_user.user_id,
            "email": existing_user.email,
            "role": existing_user.role
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": existing_user.user_id,
        "name": existing_user.name,
        "email": existing_user.email,
        "role": existing_user.role
    }


# =====================================
# Get All Users
# ADMIN ONLY
# =====================================

@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_all_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # Only admin can see all users
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can view users"
        )

    users = db.query(User).order_by(
        User.user_id.asc()
    ).all()

    return users