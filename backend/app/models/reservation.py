from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    reservation_id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.user_id"))
    book_id = Column(Integer, ForeignKey("books.book_id"))

    status = Column(String(20), default="reserved")

    user = relationship("User", back_populates="reservations")
    book = relationship("Book", back_populates="reservations")