from fastapi import HTTPException


def admin_required(current_user: dict):

    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user