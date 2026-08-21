"""
seed.py
-------
Idempotent database seeding utilities for the Smart Library System.
Safely populates initial library books if the catalog is empty.
Never modifies or deletes existing users, circulation, or fine records.
"""

import logging
from sqlalchemy.orm import Session
from app.models.book import Book
from app.database import SessionLocal

logger = logging.getLogger(__name__)

INITIAL_BOOKS = [
    {
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "author": "Robert C. Martin",
        "category": "Software Engineering",
        "rack_location": "Shelf A-1",
        "total_quantity": 5,
        "available_quantity": 5,
    },
    {
        "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
        "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
        "category": "Computer Science",
        "rack_location": "Shelf A-2",
        "total_quantity": 3,
        "available_quantity": 3,
    },
    {
        "title": "Introduction to Algorithms (4th Edition)",
        "author": "Thomas H. Cormen, Charles E. Leiserson",
        "category": "Computer Science",
        "rack_location": "Shelf A-3",
        "total_quantity": 4,
        "available_quantity": 4,
    },
    {
        "title": "The Pragmatic Programmer: Your Journey to Mastery",
        "author": "David Thomas, Andrew Hunt",
        "category": "Software Engineering",
        "rack_location": "Shelf B-1",
        "total_quantity": 4,
        "available_quantity": 4,
    },
    {
        "title": "Designing Data-Intensive Applications",
        "author": "Martin Kleppmann",
        "category": "Database Systems",
        "rack_location": "Shelf B-2",
        "total_quantity": 3,
        "available_quantity": 3,
    },
    {
        "title": "Artificial Intelligence: A Modern Approach",
        "author": "Stuart Russell, Peter Norvig",
        "category": "Artificial Intelligence",
        "rack_location": "Shelf C-1",
        "total_quantity": 2,
        "available_quantity": 2,
    },
    {
        "title": "Deep Learning with Python",
        "author": "François Chollet",
        "category": "Artificial Intelligence",
        "rack_location": "Shelf C-2",
        "total_quantity": 3,
        "available_quantity": 3,
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "category": "Fiction",
        "rack_location": "Shelf D-1",
        "total_quantity": 6,
        "available_quantity": 6,
    },
    {
        "title": "Thinking, Fast and Slow",
        "author": "Daniel Kahneman",
        "category": "Psychology",
        "rack_location": "Shelf E-1",
        "total_quantity": 4,
        "available_quantity": 4,
    },
    {
        "title": "Zero to One: Notes on Startups",
        "author": "Peter Thiel, Blake Masters",
        "category": "Business",
        "rack_location": "Shelf F-1",
        "total_quantity": 3,
        "available_quantity": 3,
    },
]


def seed_initial_books(db: Session | None = None) -> int:
    """
    Idempotently seeds initial library catalog books if the books table is empty.

    - If books already exist, logs message and exits without modifying any records.
    - If empty, inserts the 10 initial books and commits the transaction.
    - Safe for production: never alters or drops users, loans, or fines.
    - Returns the count of seeded books (0 if already seeded).
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        existing_count = db.query(Book).count()
        if existing_count > 0:
            logger.info("Library books already exist; skipping seed")
            return 0

        logger.info("Books catalog is empty. Seeding %d initial books...", len(INITIAL_BOOKS))
        for book_data in INITIAL_BOOKS:
            book = Book(
                title=book_data["title"],
                author=book_data.get("author"),
                category=book_data.get("category"),
                rack_location=book_data.get("rack_location"),
                total_quantity=book_data.get("total_quantity", 1),
                available_quantity=book_data.get("available_quantity", 1),
            )
            db.add(book)

        db.commit()
        logger.info("Library catalog seeded successfully: %d books", len(INITIAL_BOOKS))
        return len(INITIAL_BOOKS)

    except Exception as exc:
        db.rollback()
        logger.error("Error during initial book seeding: %s", exc)
        return 0
    finally:
        if should_close:
            db.close()
