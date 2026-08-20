from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.book import Book

from app.schemas.book import (
    BookCreate,
    BookResponse
)

from app.utils.auth import get_current_user
from app.utils.permissions import admin_required



router = APIRouter(
    prefix="/books",
    tags=["Books"]
)





# =====================================
# Add New Book (Admin Only)
# =====================================

@router.post("/", response_model=BookResponse)
def add_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):


    admin_required(current_user)



    new_book = Book(

        title=book.title,

        author=book.author,

        category=book.category,

        rack_location=book.rack_location,

        total_quantity=book.total_quantity,

        available_quantity=book.available_quantity

    )



    db.add(new_book)

    db.commit()

    db.refresh(new_book)



    return new_book







# =====================================
# View All Books (with optional filters)
# =====================================

@router.get("/", response_model=list[BookResponse])
def get_all_books(
    search: str | None = None,
    category: str | None = None,
    available_only: bool | None = None,
    rack_location: str | None = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(Book)

    if search:
        search_pattern = f"%{search.strip()}%"
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Book.title.ilike(search_pattern),
                Book.author.ilike(search_pattern),
                Book.category.ilike(search_pattern)
            )
        )

    if category and category.strip() and category.lower() != "all":
        query = query.filter(Book.category == category.strip())

    if rack_location and rack_location.strip() and rack_location.lower() != "all":
        query = query.filter(Book.rack_location == rack_location.strip())

    if available_only is True:
        query = query.filter(Book.available_quantity > 0)
    elif available_only is False:
        query = query.filter(Book.available_quantity == 0)

    books = query.order_by(Book.book_id.desc()).all()
    return books


# =====================================
# Search Books
# =====================================

@router.get("/search", response_model=list[BookResponse])
def search_books(
    title: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query_str = q or title or ""
    from sqlalchemy import or_
    search_pattern = f"%{query_str.strip()}%"
    books = db.query(Book).filter(
        or_(
            Book.title.ilike(search_pattern),
            Book.author.ilike(search_pattern)
        )
    ).all()

    return books







# =====================================
# View Single Book
# =====================================

@router.get("/{book_id}", response_model=BookResponse)
def get_book(

    book_id: int,

    db: Session = Depends(get_db),

    current_user: dict = Depends(get_current_user)

):


    book = db.query(Book).filter(

        Book.book_id == book_id

    ).first()



    if not book:

        raise HTTPException(

            status_code=404,

            detail="Book not found"

        )



    return book







# =====================================
# Update Book (Admin Only)
# =====================================

@router.put("/{book_id}", response_model=BookResponse)
def update_book(

    book_id: int,

    book: BookCreate,

    db: Session = Depends(get_db),

    current_user: dict = Depends(get_current_user)

):


    admin_required(current_user)



    existing_book = db.query(Book).filter(

        Book.book_id == book_id

    ).first()



    if not existing_book:

        raise HTTPException(

            status_code=404,

            detail="Book not found"

        )




    existing_book.title = book.title

    existing_book.author = book.author

    existing_book.category = book.category

    existing_book.rack_location = book.rack_location

    existing_book.total_quantity = book.total_quantity

    existing_book.available_quantity = book.available_quantity




    db.commit()

    db.refresh(existing_book)



    return existing_book







# =====================================
# Delete Book (Admin Only)
# =====================================

@router.delete("/{book_id}")
def delete_book(

    book_id: int,

    db: Session = Depends(get_db),

    current_user: dict = Depends(get_current_user)

):


    admin_required(current_user)



    book = db.query(Book).filter(

        Book.book_id == book_id

    ).first()



    if not book:

        raise HTTPException(

            status_code=404,

            detail="Book not found"

        )



    db.delete(book)

    db.commit()



    return {

        "message": "Book deleted successfully"

    }