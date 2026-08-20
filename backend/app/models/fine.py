
from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Fine(Base):
    __tablename__ = "fines"

    fine_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    amount = Column(Float, default=0.0)
    paid = Column(Boolean, default=False)

    user = relationship("User")
