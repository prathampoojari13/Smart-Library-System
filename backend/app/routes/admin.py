from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.book import Book
from app.models.borrow import Borrow
from app.models.fine import Fine
from app.utils.auth import get_current_user
from app.utils.permissions import admin_required


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# -------------------------
# Admin Dashboard
# -------------------------
@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    # Check admin access
    admin_required(current_user)


    total_users = db.query(User).count()

    total_books = db.query(Book).count()

    active_borrowings = db.query(Borrow).filter(
        Borrow.returned == False
    ).count()

    pending_fines = db.query(Fine).filter(
        Fine.paid == False
    ).count()


    return {
        "total_users": total_users,
        "total_books": total_books,
        "active_borrowings": active_borrowings,
        "pending_fines": pending_fines
    }