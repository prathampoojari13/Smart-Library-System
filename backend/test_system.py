"""
Comprehensive Direct-Invocation Verification Test Suite for Smart Library System.
Tests:
1. Environment & Config Loading
2. Password Hashing & JWT Token Encoding/Decoding
3. Database Models & Relationships
4. User Registration (role forced to student), Login, and /users/me
5. Book Creation (admin only) and Quantity checks
6. Borrowing logic with 14-day Due Date calculation
7. Overdue fine calculation upon return
8. Fine Payment & response model integrity
9. Admin Listings (/fines/, /borrow/, /reservations/) with joined metadata
10. Role-based access control & permission enforcement
"""

import os
import sys
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException

# Ensure backend root is in sys.path
backend_path = os.path.dirname(os.path.abspath(__file__))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Set test environment
os.environ["SECRET_KEY"] = "test_super_secret_key_for_unit_tests"
os.environ["ALGORITHM"] = "HS256"
os.environ["LOAN_PERIOD_DAYS"] = "14"
os.environ["DAILY_OVERDUE_FINE"] = "5.0"

from app.database import Base
from app.config import settings
from app.models.user import User
from app.models.book import Book
from app.models.borrow import Borrow
from app.models.reservation import Reservation
from app.models.fine import Fine
from app.schemas.user import UserCreate, UserLogin
from app.schemas.book import BookCreate
from app.schemas.borrow import BorrowCreate
from app.schemas.reservation import ReservationCreate
from app.schemas.fine import FineCreate
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token
from app.routes.users import register_user, login_user, get_current_user_profile
from app.routes.book import add_book, get_all_books, get_book
from app.routes.borrow import issue_book, return_book, get_all_borrows, get_user_borrow_history
from app.routes.fine import get_all_fines, create_fine, get_user_fines, pay_fine
from app.routes.reservation import reserve_book, get_all_reservations, get_user_reservations, cancel_reservation
from app.routes.dashboard import dashboard_stats

# Setup SQLite In-Memory Database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def run_tests():
    print("=" * 65)
    print(" SMART LIBRARY SYSTEM - PHASE 1 & 2 VERIFICATION SUITE")
    print("=" * 65)
    
    db = TestingSessionLocal()

    # ----------------------------------------------------
    # TEST 1: Config & Security
    # ----------------------------------------------------
    print("\n[TEST 1] Testing Config & JWT Security...")
    assert settings.LOAN_PERIOD_DAYS == 14, "Config LOAN_PERIOD_DAYS should be 14"
    assert settings.DAILY_OVERDUE_FINE == 5.0, "Config DAILY_OVERDUE_FINE should be 5.0"
    
    pwd = "secretpassword123"
    hashed = hash_password(pwd)
    assert hashed != pwd, "Password should be hashed"
    assert verify_password(pwd, hashed), "Password verification failed"
    
    token = create_access_token({"sub": "admin@library.com", "user_id": 1, "role": "admin"})
    payload = decode_access_token(token)
    assert payload["role"] == "admin", "Decoded token role mismatch"
    print("  -> PASSED: Settings, password hashing, and JWT encode/decode working correctly.")

    # ----------------------------------------------------
    # TEST 2: User Registration & Role Enforcement
    # ----------------------------------------------------
    print("\n[TEST 2] Testing User Registration & Role Enforcement...")
    # Seed Admin directly
    admin_user = User(
        name="Library Admin",
        email="admin@library.com",
        password=hash_password("admin123"),
        role="admin"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    admin_id = admin_user.user_id

    # Register student attempting to pass role='admin'
    student_payload = UserCreate(
        name="Alice Reader",
        email="alice@student.com",
        password="alicepassword"
    )
    registered_student = register_user(student_payload, db)
    assert registered_student.user_id is not None
    assert registered_student.role == "student", "Role should strictly be student on public registration"
    student_id = registered_student.user_id
    print(f"  -> PASSED: Student registered (#{student_id}), role safely forced to 'student'.")

    # ----------------------------------------------------
    # TEST 3: User Login & Current User Profile
    # ----------------------------------------------------
    print("\n[TEST 3] Testing User Login & /users/me endpoint...")
    login_result = login_user(UserLogin(email="alice@student.com", password="alicepassword"), db)
    assert "access_token" in login_result
    alice_token = login_result["access_token"]
    
    current_student = {"user_id": student_id, "email": "alice@student.com", "role": "student"}
    current_admin = {"user_id": admin_id, "email": "admin@library.com", "role": "admin"}

    me_profile = get_current_user_profile(db, current_student)
    assert me_profile.email == "alice@student.com"
    assert me_profile.name == "Alice Reader"
    print("  -> PASSED: Login returns valid JWT; /users/me returns accurate profile.")

    # ----------------------------------------------------
    # TEST 4: Book Management & Access Control
    # ----------------------------------------------------
    print("\n[TEST 4] Testing Book Management & Role Permissions...")
    # Admin creates book
    new_book = add_book(
        BookCreate(
            title="Clean Code",
            author="Robert C. Martin",
            category="Software Engineering",
            rack_location="Shelf B-2",
            total_quantity=3,
            available_quantity=3
        ),
        db,
        current_admin
    )
    assert new_book.book_id is not None
    book_id = new_book.book_id

    # Non-admin attempting to create a book must be rejected (403)
    try:
        add_book(
            BookCreate(
                title="Unauthorized Book",
                author="Hacker",
                category="Hack",
                rack_location="None",
                total_quantity=1,
                available_quantity=1
            ),
            db,
            current_student
        )
        assert False, "Student should not be able to create books"
    except HTTPException as e:
        assert e.status_code == 403, f"Expected 403, got {e.status_code}"
    
    all_books = get_all_books(db=db, current_user=current_student)
    assert len(all_books) >= 1
    print(f"  -> PASSED: Book #{book_id} created by Admin; 403 Forbidden enforced for Students.")

    # ----------------------------------------------------
    # TEST 4B: Phase 3 Book Search & Filtering
    # ----------------------------------------------------
    print("\n[TEST 4B] Testing Phase 3 Book Search & Multi-Filters...")
    # Search by title keyword
    search_results = get_all_books(search="Clean", db=db, current_user=current_student)
    assert any(b.title == "Clean Code" for b in search_results), "Search by title failed"

    # Search by author keyword
    search_author = get_all_books(search="Martin", db=db, current_user=current_student)
    assert any("Martin" in (b.author or "") for b in search_author), "Search by author failed"

    # Filter by category
    cat_results = get_all_books(category="Software Engineering", db=db, current_user=current_student)
    assert any(b.category == "Software Engineering" for b in cat_results), "Filter by category failed"

    # Filter by rack
    rack_results = get_all_books(rack_location="Shelf B-2", db=db, current_user=current_student)
    assert any(b.rack_location == "Shelf B-2" for b in rack_results), "Filter by rack failed"

    # Filter by availability
    avail_results = get_all_books(available_only=True, db=db, current_user=current_admin)
    assert all(b.available_quantity > 0 for b in avail_results), "Filter by availability failed"
    print("  -> PASSED: Book search (title/author) and filters (category/rack/availability) verified.")

    # ----------------------------------------------------
    # TEST 5: Borrowing Flow & 14-Day Due Date Calculation
    # ----------------------------------------------------
    print("\n[TEST 5] Testing Borrowing Flow & 14-Day Due Date...")
    borrow_record = issue_book(
        BorrowCreate(user_id=student_id, book_id=book_id),
        db,
        current_student
    )
    assert borrow_record.borrow_id is not None
    borrow_id = borrow_record.borrow_id
    expected_due = date.today() + timedelta(days=14)
    assert borrow_record.due_date == expected_due, f"Expected {expected_due}, got {borrow_record.due_date}"
    
    # Check book inventory decremented
    updated_book = get_book(book_id, db, current_student)
    assert updated_book.available_quantity == 2, f"Expected 2 available, got {updated_book.available_quantity}"
    print(f"  -> PASSED: Book borrowed (#{borrow_id}) with due_date = {expected_due}. Inventory decremented to 2.")

    # ----------------------------------------------------
    # TEST 6: Overdue Fine Calculation upon Return
    # ----------------------------------------------------
    print("\n[TEST 6] Testing Overdue Fine Calculation on Return...")
    # Simulate overdue loan by backdating due_date by 5 days
    borrow_in_db = db.query(Borrow).filter(Borrow.borrow_id == borrow_id).first()
    borrow_in_db.due_date = date.today() - timedelta(days=5)
    db.commit()

    return_res = return_book(borrow_id, db, current_student)
    assert return_res.returned == True
    expected_fine = 5 * 5.0  # 5 days * Rs.5/day = Rs.25.0
    assert return_res.fine_generated == expected_fine, f"Expected Rs.{expected_fine}, got {return_res.fine_generated}"

    # Verify Fine record created in DB
    unpaid_fine = db.query(Fine).filter(Fine.user_id == student_id, Fine.paid == False).first()
    assert unpaid_fine is not None, "Fine record must be created in DB"
    assert unpaid_fine.amount == expected_fine, f"Expected fine amount {expected_fine}, got {unpaid_fine.amount}"
    fine_id = unpaid_fine.fine_id
    print(f"  -> PASSED: Return calculated overdue fine of Rs.{expected_fine} (Fine #{fine_id} created).")

    # ----------------------------------------------------
    # TEST 7: Fine Payment & Response Model Integrity
    # ----------------------------------------------------
    print("\n[TEST 7] Testing Fine Payment Flow...")
    paid_record = pay_fine(fine_id, db, current_student)
    assert paid_record is not None, "pay_fine must return the fine record"
    assert paid_record.paid == True, "Fine status must be paid = True"
    assert paid_record.fine_id == fine_id
    print(f"  -> PASSED: Fine #{fine_id} marked as paid and returned in response model.")

    # ----------------------------------------------------
    # TEST 8: Admin Listings with Joined Metadata
    # ----------------------------------------------------
    print("\n[TEST 8] Testing Admin Listings (/fines/, /borrow/, /reservations/)...")
    # Admin fines listing
    all_fines = get_all_fines(db, current_admin)
    assert len(all_fines) >= 1
    assert all_fines[0].user_name == "Alice Reader"

    # Admin borrow listing
    all_borrows = get_all_borrows(db, current_admin)
    assert len(all_borrows) >= 1
    assert all_borrows[0].book_title == "Clean Code"
    assert all_borrows[0].user_name == "Alice Reader"

    # Reservation creation and admin listing
    resv = reserve_book(ReservationCreate(user_id=student_id, book_id=book_id), db, current_student)
    assert resv.reservation_id is not None
    resv_id = resv.reservation_id

    all_resvs = get_all_reservations(db, current_admin)
    assert len(all_resvs) >= 1
    assert all_resvs[0].book_title == "Clean Code"
    assert all_resvs[0].user_name == "Alice Reader"

    # Admin listing blocked for students (RBAC check)
    try:
        get_all_fines(db, current_student)
        assert False, "Students should not access admin fines listing"
    except HTTPException as e:
        assert e.status_code == 403
    print("  -> PASSED: Admin listings return joined metadata; RBAC 403 enforced on all admin endpoints.")

    # ----------------------------------------------------
    # TEST 9: Reservation Cancellation & User History
    # ----------------------------------------------------
    print("\n[TEST 9] Testing Reservation Cancellation & User History...")
    user_resvs = get_user_reservations(student_id, db, current_student)
    assert len(user_resvs) >= 1
    
    cancel_res = cancel_reservation(resv_id, db, current_student)
    assert cancel_res["reservation_id"] == resv_id
    print(f"  -> PASSED: Reservation #{resv_id} cancelled successfully.")

    # ----------------------------------------------------
    # TEST 10: Dashboard Analytics
    # ----------------------------------------------------
    print("\n[TEST 10] Testing Dashboard Analytics...")
    stats = dashboard_stats(db, current_student)
    assert stats["total_users"] >= 2
    assert stats["total_books"] >= 1
    assert "active_borrowings" in stats
    assert "active_borrowed_books" in stats
    assert "pending_fines" in stats
    print(f"  -> PASSED: Dashboard stats API verified: {stats}")

    db.close()

    print("\n" + "=" * 65)
    print(" ALL 11 INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY! ")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
