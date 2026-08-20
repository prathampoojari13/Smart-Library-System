from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.reservation import Reservation
from app.models.book import Book
from app.models.user import User
from app.schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
    ReservationDetailResponse
)
from app.utils.auth import get_current_user
from app.utils.permissions import admin_required


router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)


# =====================================
# Get All Reservations - ADMIN ONLY
# =====================================

@router.get("/", response_model=list[ReservationDetailResponse])
def get_all_reservations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    admin_required(current_user)

    reservations = db.query(Reservation).order_by(Reservation.reservation_id.desc()).all()

    result = []
    for r in reservations:
        user = r.user if hasattr(r, "user") and r.user else db.query(User).filter(User.user_id == r.user_id).first()
        book = r.book if hasattr(r, "book") and r.book else db.query(Book).filter(Book.book_id == r.book_id).first()

        result.append(
            ReservationDetailResponse(
                reservation_id=r.reservation_id,
                user_id=r.user_id,
                book_id=r.book_id,
                status=r.status,
                book_title=book.title if book else f"Book #{r.book_id}",
                book_author=book.author if book else "",
                user_name=user.name if user else f"User #{r.user_id}",
                user_email=user.email if user else ""
            )
        )

    return result


# =====================================
# Reserve Book
# =====================================

@router.post("/", response_model=ReservationResponse)
def reserve_book(
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # User can reserve for themselves or admin can reserve for user
    if reservation.user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can reserve books only for your account"
        )

    # Check book exists
    book = db.query(Book).filter(
        Book.book_id == reservation.book_id
    ).first()

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    # Check duplicate active reservation
    existing = db.query(Reservation).filter(
        Reservation.user_id == reservation.user_id,
        Reservation.book_id == reservation.book_id,
        Reservation.status == "reserved"
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Book already reserved"
        )

    # Create reservation
    new_reservation = Reservation(
        user_id=reservation.user_id,
        book_id=reservation.book_id,
        status="reserved"
    )

    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    return new_reservation


# =====================================
# Get User Reservations
# =====================================

@router.get(
    "/user/{user_id}",
    response_model=list[ReservationResponse]
)
def get_user_reservations(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # User can view own reservations unless admin
    if user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    reservations = db.query(
        Reservation
    ).filter(
        Reservation.user_id == user_id
    ).order_by(
        Reservation.reservation_id.desc()
    ).all()

    return reservations


# =====================================
# Cancel Reservation
# =====================================

@router.delete("/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    reservation = db.query(
        Reservation
    ).filter(
        Reservation.reservation_id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="You cannot cancel this reservation"
        )

    db.delete(reservation)
    db.commit()

    return {
        "message": "Reservation cancelled successfully",
        "reservation_id": reservation_id
    }