"""
main.py
-------
FastAPI application entry point.

This file:
    - Creates the FastAPI app instance.
    - Configures CORS for React frontend.
    - Checks MySQL connection on startup.
    - Initializes SQLAlchemy models.
    - Registers API routes.
    - Provides health-check endpoints.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import check_db_connection
from app.database import engine, Base
from app import models

from app.routes.users import router as user_router
from app.routes.book import router as book_router
from app.routes.borrow import router as borrow_router
from app.routes.reservation import router as reservation_router
from app.routes.fine import router as fine_router
from app.routes.admin import router as admin_router
from app.routes import dashboard


# Logging configuration
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events.
    """

    logger.info(
        "Starting %s (env=%s)",
        settings.APP_NAME,
        settings.APP_ENV
    )

    if check_db_connection():
        logger.info("Database connection established successfully.")
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables initialized successfully.")
        except Exception as e:
            logger.error("Error creating database tables: %s", e)
    else:
        logger.warning(
            "Database connection could not be verified."
        )

    yield

    logger.info("Shutting down %s", settings.APP_NAME)


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend service for the Smart Library Management System.",
    version="0.1.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)


# ==============================
# CORS CONFIGURATION
# ==============================
# Allows React frontend (localhost:5173)
# to communicate with FastAPI backend

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ==============================
# API ROUTES
# ==============================

app.include_router(user_router)
app.include_router(book_router)
app.include_router(borrow_router)
app.include_router(reservation_router)
app.include_router(fine_router)
app.include_router(admin_router)
app.include_router(dashboard.router)


# ==============================
# HEALTH CHECK ROUTES
# ==============================

@app.get("/", tags=["Health"])
def read_root():
    """
    Basic liveness endpoint.
    """
    return {
        "message": f"{settings.APP_NAME} is running.",
        "environment": settings.APP_ENV,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Reports application and database health.
    """

    db_ok = check_db_connection()

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
    }