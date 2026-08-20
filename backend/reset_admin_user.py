"""
reset_admin_user.py
-------------------
Utility script to reset the password for pratham@gmail.com using the application's
configured bcrypt hashing mechanism and verify authentication.
"""

from app.config import settings
from app.database import SessionLocal, check_db_connection
from app.models.user import User
from app.schemas.user import UserLogin
from app.routes.users import login_user
from app.utils.security import hash_password, verify_password, decode_access_token

def reset_and_verify(email: str = "pratham@gmail.com", raw_password: str = "Admin@123"):
    print("=" * 60)
    print("ADMIN PASSWORD RESET & VERIFICATION")
    print("=" * 60)
    print(f"Target Database Host : {settings.DB_HOST}:{settings.DB_PORT}")
    print(f"Target Database Name : {settings.DB_NAME}")
    print(f"Database Username    : {settings.DB_USER}")
    print(f"Target User Email    : {email}")
    print("-" * 60)

    if not check_db_connection():
        print("[DATABASE ERROR] Could not establish connection with MySQL.")
        return False

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"[ERROR] User '{email}' not found in database '{settings.DB_NAME}'.")
            return False

        print(f"[FOUND] Existing user record: user_id={user.user_id}, role={user.role}")

        # Update password and role
        hashed_password = hash_password(raw_password)
        user.password = hashed_password
        user.role = "admin"
        db.commit()
        db.refresh(user)

        # 1. Verify database record
        updated_user = db.query(User).filter(User.email == email).first()
        print(f"[DATABASE UPDATE CONFIRMED] user_id={updated_user.user_id}, email={updated_user.email}, role={updated_user.role}")
        assert updated_user.user_id == 4, f"Expected user_id 4, got {updated_user.user_id}"
        assert updated_user.role == "admin", f"Expected role admin, got {updated_user.role}"

        # 2. Verify password verification logic
        is_valid = verify_password(raw_password, updated_user.password)
        assert is_valid == True, "verify_password check failed"
        print("[PASSWORD VERIFICATION] verify_password returned True.")

        # 3. Test actual /users/login API route
        login_payload = UserLogin(email=email, password=raw_password)
        login_response = login_user(login_payload, db)
        
        token = login_response.get("access_token")
        assert token is not None, "Login failed: access_token not received"
        assert login_response.get("user_id") == 4, f"Expected user_id 4, got {login_response.get('user_id')}"
        assert login_response.get("role") == "admin", f"Expected role admin, got {login_response.get('role')}"
        print(f"[API LOGIN CONFIRMED] POST /users/login succeeded (user_id={login_response.get('user_id')}, role={login_response.get('role')}).")

        # 4. Decode and verify JWT token payload claims
        payload = decode_access_token(token)
        assert payload.get("user_id") == 4, f"Expected JWT user_id 4, got {payload.get('user_id')}"
        assert payload.get("role") == "admin", f"Expected JWT role admin, got {payload.get('role')}"
        assert payload.get("email") == email, f"Expected JWT email {email}, got {payload.get('email')}"
        print(f"[JWT CLAIMS VERIFIED] Token payload decoded successfully: user_id={payload.get('user_id')}, role={payload.get('role')}, email={payload.get('email')}")

        print("=" * 60)
        print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"[ERROR] Reset/Verification failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_verify()
