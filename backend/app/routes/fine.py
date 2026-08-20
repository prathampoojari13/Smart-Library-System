
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.fine import Fine
from app.models.user import User
from app.schemas.fine import FineCreate, FineResponse, FineDetailResponse
from app.utils.auth import get_current_user
from app.utils.permissions import admin_required


router = APIRouter(
    prefix="/fines",
    tags=["Fines"]
)


# =====================================
# Get All Fines - ADMIN ONLY
# =====================================

@router.get("/", response_model=list[FineDetailResponse])
def get_all_fines(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    admin_required(current_user)

    fines = db.query(Fine).order_by(Fine.fine_id.desc()).all()

    result = []
    for f in fines:
        user = f.user if hasattr(f, "user") and f.user else db.query(User).filter(User.user_id == f.user_id).first()
        result.append(
            FineDetailResponse(
                fine_id=f.fine_id,
                user_id=f.user_id,
                amount=f.amount,
                paid=f.paid,
                user_name=user.name if user else f"User #{f.user_id}",
                user_email=user.email if user else ""
            )
        )

    return result


# =====================================
# Create Fine - ADMIN ONLY
# =====================================

@router.post("/", response_model=FineResponse)
def create_fine(
    fine: FineCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    admin_required(current_user)

    # Check whether student exists
    user = db.query(User).filter(
        User.user_id == fine.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Fine amount must be greater than zero
    if fine.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Fine amount must be greater than zero"
        )

    # Create fine
    new_fine = Fine(
        user_id=fine.user_id,
        amount=fine.amount,
        paid=False
    )

    db.add(new_fine)
    db.commit()
    db.refresh(new_fine)

    return new_fine


# =====================================
# Get User Fines
# =====================================

@router.get(
    "/user/{user_id}",
    response_model=list[FineResponse]
)
def get_user_fines(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # User can only see their own fines unless admin
    if user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    fines = db.query(Fine).filter(
        Fine.user_id == user_id
    ).order_by(
        Fine.fine_id.desc()
    ).all()

    return fines


# =====================================
# Pay Fine
# =====================================

@router.put(
    "/{fine_id}/pay",
    response_model=FineResponse
)
def pay_fine(
    fine_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Find fine
    fine = db.query(Fine).filter(
        Fine.fine_id == fine_id
    ).first()

    if not fine:
        raise HTTPException(
            status_code=404,
            detail="Fine not found"
        )

    # User can only pay their own fine unless admin
    if fine.user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="You cannot pay another user's fine"
        )

    # Check whether already paid
    if fine.paid:
        raise HTTPException(
            status_code=400,
            detail="Fine already paid"
        )

    # Mark fine as paid
    fine.paid = True

    db.commit()
    db.refresh(fine)

    return fine

