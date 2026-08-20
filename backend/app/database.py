"""
database.py
-----------
SQLAlchemy database setup for MySQL (via PyMySQL).

Responsibilities:
    1. Create the SQLAlchemy Engine (the connection pool to MySQL).
    2. Create a SessionLocal factory for producing DB sessions.
    3. Declare the shared `Base` class that future ORM models will inherit
       from (models themselves are intentionally NOT defined here).
    4. Provide a FastAPI dependency (`get_db`) for safe session handling
       inside path operations.

This file has no knowledge of routes or business logic — it is purely
infrastructure, which keeps the architecture clean and testable.
"""

import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
# `pool_pre_ping` checks that a pooled connection is still alive before
# handing it out — this avoids "MySQL server has gone away" errors caused
# by idle connections being dropped by the server or a firewall.
#
# `pool_recycle` proactively recycles connections older than this many
# seconds, which works around MySQL's default `wait_timeout`.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG,  # log SQL statements only when DEBUG=True
    future=True,
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
# autocommit=False / autoflush=False are the recommended defaults for web
# apps: each request explicitly controls when it commits, avoiding
# surprise partial writes.
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)

# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------
# All future ORM models (e.g. Book, Member, Loan) will inherit from this
# Base class. It is defined here — not in main.py — so models can import
# it without creating circular imports.
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session and guarantees
    it is closed after the request finishes, even if an exception
    is raised while handling the request.

    Usage in a future route:

        @router.get("/books")
        def list_books(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError:
        db.rollback()
        raise
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Lightweight connectivity check used at startup to fail fast if
    MySQL is unreachable, rather than discovering it on the first
    incoming request.
    """
    try:
        with engine.connect() as connection:
            connection.exec_driver_sql("SELECT 1")
        return True
    except SQLAlchemyError as exc:
        logger.error("Database connection check failed: %s", exc)
        return False