from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Book(Base):
    __tablename__ = "books"

    book_id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)
    author = Column(String(100))
    category = Column(String(50))

    rack_location = Column(String(50))

    total_quantity = Column(Integer, default=1)
    available_quantity = Column(Integer, default=1)

    borrowed_books = relationship("Borrow", back_populates="book")
    reservations = relationship("Reservation", back_populates="book")