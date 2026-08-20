from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.book import Book
from app.models.borrow import Borrow
from app.models.reservation import Reservation
from app.models.fine import Fine
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_users = db.query(User).count()
    total_books = db.query(Book).count()

    active_borrowed_books = db.query(Borrow).filter(
        Borrow.returned == False
    ).count()

    total_reservations = db.query(Reservation).filter(
        Reservation.status == "reserved"
    ).count()

    pending_fines = db.query(
        func.coalesce(func.sum(Fine.amount), 0.0)
    ).filter(
        Fine.paid == False
    ).scalar()

    return {
        "total_users": total_users,
        "total_books": total_books,
        "active_borrowed_books": active_borrowed_books,
        "active_borrowings": active_borrowed_books,
        "total_reservations": total_reservations,
        "pending_fines": float(pending_fines or 0.0)
    }