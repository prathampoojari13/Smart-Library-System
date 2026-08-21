"""
password.py
-----------
Production-grade password hashing and verification using direct `bcrypt`.

Resolves the Passlib + bcrypt incompatibilities (AttributeError: __about__
and 72-byte password length issues) by directly leveraging the official `bcrypt`
cryptographic library.
"""

import bcrypt


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt with automatic salt generation.
    Safely truncates password bytes to 72 bytes to adhere to bcrypt's internal limit.
    """
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a stored bcrypt hash string.
    Returns True if valid, False otherwise.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False