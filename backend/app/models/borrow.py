from sqlalchemy import Column, Integer, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Borrow(Base):
    __tablename__ = "borrow"

    borrow_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.book_id"), nullable=False)

    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    return_date = Column(Date, nullable=True)

    returned = Column(Boolean, default=False)

    user = relationship("User", back_populates="borrowed_books")
    book = relationship("Book", back_populates="borrowed_books")