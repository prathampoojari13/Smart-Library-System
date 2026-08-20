from pydantic import BaseModel


class FineCreate(BaseModel):
    user_id: int
    amount: float


class FineResponse(BaseModel):
    fine_id: int
    user_id: int
    amount: float | None
    paid: bool | None

    class Config:
        from_attributes = True


class FineDetailResponse(BaseModel):
    fine_id: int
    user_id: int
    amount: float
    paid: bool
    user_name: str | None = None
    user_email: str | None = None

    class Config:
        from_attributes = True