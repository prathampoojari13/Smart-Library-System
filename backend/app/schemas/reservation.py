from pydantic import BaseModel


class ReservationCreate(BaseModel):
    user_id: int
    book_id: int


class ReservationResponse(BaseModel):
    reservation_id: int
    user_id: int
    book_id: int
    status: str | None

    class Config:
        from_attributes = True


class ReservationDetailResponse(BaseModel):
    reservation_id: int
    user_id: int
    book_id: int
    status: str | None
    book_title: str | None = None
    book_author: str | None = None
    user_name: str | None = None
    user_email: str | None = None

    class Config:
        from_attributes = True