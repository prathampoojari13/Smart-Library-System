from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.borrow import Borrow
from app.models.book import Book
from app.models.user import User
from app.models.fine import Fine
from app.schemas.borrow import (
    BorrowCreate,
    BorrowResponse,
    BorrowDetailResponse
)
from app.utils.auth import get_current_user
from app.utils.permissions import admin_required


router = APIRouter(
    prefix="/borrow",
    tags=["Borrow"]
)


# =====================================
# Get All Borrow Records - ADMIN ONLY
# =====================================

@router.get("/", response_model=list[BorrowDetailResponse])
def get_all_borrows(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    admin_required(current_user)

    borrows = db.query(Borrow).order_by(Borrow.borrow_id.desc()).all()
    today = date.today()

    result = []
    for b in borrows:
        user = b.user if hasattr(b, "user") and b.user else db.query(User).filter(User.user_id == b.user_id).first()
        book = b.book if hasattr(b, "book") and b.book else db.query(Book).filter(Book.book_id == b.book_id).first()

        is_overdue = False
        overdue_days = 0
        calculated_fine = 0.0

        if not b.returned and b.due_date and today > b.due_date:
            is_overdue = True
            overdue_days = (today - b.due_date).days
            calculated_fine = round(overdue_days * settings.DAILY_OVERDUE_FINE, 2)
        elif b.returned and b.due_date and b.return_date and b.return_date > b.due_date:
            is_overdue = True
            overdue_days = (b.return_date - b.due_date).days
            calculated_fine = round(overdue_days * settings.DAILY_OVERDUE_FINE, 2)

        result.append(
            BorrowDetailResponse(
                borrow_id=b.borrow_id,
                user_id=b.user_id,
                book_id=b.book_id,
                issue_date=b.issue_date,
                due_date=b.due_date,
                return_date=b.return_date,
                returned=b.returned if b.returned is not None else False,
                book_title=book.title if book else f"Book #{b.book_id}",
                book_author=book.author if book else "",
                user_name=user.name if user else f"User #{b.user_id}",
                user_email=user.email if user else "",
                is_overdue=is_overdue,
                overdue_days=overdue_days,
                calculated_fine=calculated_fine
            )
        )

    return result


# =====================================
# Issue Book
# =====================================

@router.post("/", response_model=BorrowResponse)
def issue_book(
    borrow: BorrowCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # User can borrow for themselves or admin can issue on their behalf
    if borrow.user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can borrow books only for your account"
        )

    # Check book exists
    book = db.query(Book).filter(
        Book.book_id == borrow.book_id
    ).first()

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    # Check book availability
    if book.available_quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Book not available"
        )

    # Prevent borrowing same book again before returning previous copy
    existing_borrow = db.query(Borrow).filter(
        Borrow.user_id == borrow.user_id,
        Borrow.book_id == borrow.book_id,
        Borrow.returned == False
    ).first()

    if existing_borrow:
        raise HTTPException(
            status_code=400,
            detail="You already borrowed this book"
        )

    # Calculate issue and due dates
    today = date.today()
    due = today + timedelta(days=settings.LOAN_PERIOD_DAYS)

    new_borrow = Borrow(
        user_id=borrow.user_id,
        book_id=borrow.book_id,
        issue_date=today,
        due_date=due,
        returned=False
    )

    # Reduce available quantity
    book.available_quantity -= 1

    db.add(new_borrow)
    db.commit()
    db.refresh(new_borrow)

    return new_borrow


# =====================================
# Return Book (Calculates overdue fines)
# =====================================

@router.put("/{borrow_id}/return", response_model=BorrowResponse)
def return_book(
    borrow_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    borrow = db.query(Borrow).filter(
        Borrow.borrow_id == borrow_id
    ).first()

    if not borrow:
        raise HTTPException(
            status_code=404,
            detail="Borrow record not found"
        )

    # User can return only own book unless admin
    if borrow.user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="You cannot return another user's book"
        )

    # Already returned check
    if borrow.returned:
        raise HTTPException(
            status_code=400,
            detail="Book already returned"
        )

    today = date.today()
    borrow.return_date = today
    borrow.returned = True

    # Calculate overdue fine if returned past due_date
    fine_amount = 0.0
    if borrow.due_date and today > borrow.due_date:
        overdue_days = (today - borrow.due_date).days
        if overdue_days > 0:
            fine_amount = round(overdue_days * settings.DAILY_OVERDUE_FINE, 2)
            auto_fine = Fine(
                user_id=borrow.user_id,
                amount=fine_amount,
                paid=False
            )
            db.add(auto_fine)

    # Increase book available quantity
    book = db.query(Book).filter(
        Book.book_id == borrow.book_id
    ).first()

    if book:
        book.available_quantity += 1

    db.commit()
    db.refresh(borrow)

    response_data = BorrowResponse(
        borrow_id=borrow.borrow_id,
        user_id=borrow.user_id,
        book_id=borrow.book_id,
        issue_date=borrow.issue_date,
        due_date=borrow.due_date,
        return_date=borrow.return_date,
        returned=borrow.returned,
        fine_generated=fine_amount if fine_amount > 0 else None
    )

    return response_data


# =====================================
# Get User Borrow History
# =====================================

@router.get(
    "/user/{user_id}",
    response_model=list[BorrowResponse]
)
def get_user_borrow_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # User can view own history unless admin
    if user_id != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="You cannot view another user's borrow history"
        )

    borrows = db.query(Borrow).filter(
        Borrow.user_id == user_id
    ).order_by(Borrow.borrow_id.desc()).all()

    return borrows