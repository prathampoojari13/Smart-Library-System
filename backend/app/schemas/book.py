from pydantic import BaseModel


class BookCreate(BaseModel):
    title: str
    author: str | None = None
    category: str | None = None
    rack_location: str | None = None
    total_quantity: int
    available_quantity: int


class BookResponse(BaseModel):
    book_id: int
    title: str
    author: str | None
    category: str | None
    rack_location: str | None
    total_quantity: int
    available_quantity: int

    class Config:
        from_attributes = True