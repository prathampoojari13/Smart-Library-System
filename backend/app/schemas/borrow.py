from pydantic import BaseModel
from datetime import date


class BorrowCreate(BaseModel):
    user_id: int
    book_id: int


class BorrowResponse(BaseModel):
    borrow_id: int
    user_id: int
    book_id: int
    issue_date: date | None = None
    due_date: date | None = None
    return_date: date | None = None
    returned: bool | None = None
    fine_generated: float | None = None

    class Config:
        from_attributes = True


class BorrowDetailResponse(BaseModel):
    borrow_id: int
    user_id: int
    book_id: int
    issue_date: date | None = None
    due_date: date | None = None
    return_date: date | None = None
    returned: bool = False
    book_title: str | None = None
    book_author: str | None = None
    user_name: str | None = None
    user_email: str | None = None
    is_overdue: bool = False
    overdue_days: int = 0
    calculated_fine: float = 0.0

    class Config:
        from_attributes = True