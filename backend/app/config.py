"""
config.py
---------
Centralized application configuration.

Loads environment variables from a .env file (via python-dotenv) and exposes
them through a single, typed Settings object. Every other module in the
application should import `settings` from here instead of calling
os.getenv() directly — this keeps configuration access consistent and
makes it trivial to swap the source (e.g. env vars, vault, config server)
later without touching business logic.
"""

import os
from dataclasses import dataclass
from functools import lru_cache

from pathlib import Path
from dotenv import load_dotenv

# Explicitly load backend/.env relative to this config file (override=False to prioritize cloud env vars)
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path, override=False)
else:
    load_dotenv(override=False)



def _get_env(key: str, default: str | None = None, required: bool = False) -> str:
    """
    Fetch an environment variable with basic validation.

    Raises a clear error at startup (fail fast) instead of letting the
    app boot with missing/broken configuration and fail later with a
    confusing database error.
    """
    value = os.getenv(key, default)
    if required and (value is None or value.strip() == ""):
        raise RuntimeError(
            f"Missing required environment variable: '{key}'. "
            f"Please set it in your .env file."
        )
    return value


@dataclass(frozen=True)
class Settings:
    """
    Immutable application settings.

    Using a frozen dataclass prevents accidental mutation of config
    values at runtime, which is a common source of hard-to-trace bugs.
    """

    # --- App metadata ---
    APP_NAME: str = _get_env("APP_NAME", "Smart Library Management System")
    APP_ENV: str = _get_env("APP_ENV", "development")
    DEBUG: bool = _get_env("DEBUG", "False").lower() in ("1", "true", "yes")

    # --- MySQL database credentials / connection URL ---
    DATABASE_URL_ENV: str | None = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")
    DB_HOST: str = _get_env("DB_HOST", "localhost")
    DB_PORT: int = int(_get_env("DB_PORT", "3306"))
    DB_USER: str = _get_env("DB_USER", "root")
    DB_PASSWORD: str = _get_env("DB_PASSWORD", "")
    DB_NAME: str = _get_env("DB_NAME", "smart_library")

    # --- Security & JWT settings ---
    SECRET_KEY: str = _get_env("SECRET_KEY", "smart_library_secret_key_change_in_production_32bytes")
    ALGORITHM: str = _get_env("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(_get_env("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # --- Library rules ---
    LOAN_PERIOD_DAYS: int = int(_get_env("LOAN_PERIOD_DAYS", "14"))
    DAILY_OVERDUE_FINE: float = float(_get_env("DAILY_OVERDUE_FINE", "5.0"))

    # --- CORS settings ---
    CORS_ORIGINS: str = _get_env(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:5174,http://127.0.0.1:5174,http://localhost:8000,http://127.0.0.1:8000,http://localhost:80,http://localhost"
    )

    @property
    def CORS_ORIGINS_LIST(self) -> list[str]:
        """
        Parse comma-separated CORS_ORIGINS into a list of origins.
        """
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def DATABASE_URL(self) -> str:
        """
        Build the SQLAlchemy connection string for MySQL using the
        PyMySQL driver.

        If DATABASE_URL or MYSQL_URL environment variable is provided directly (e.g. in cloud/Docker),
        use it, ensuring it uses the mysql+pymysql driver prefix.
        """
        if self.DATABASE_URL_ENV and self.DATABASE_URL_ENV.strip():
            url = self.DATABASE_URL_ENV.strip()
            if url.startswith("mysql://"):
                url = url.replace("mysql://", "mysql+pymysql://", 1)
            return url

        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached Settings instance.

    lru_cache ensures the .env file is parsed and validated only once
    per process, and every part of the app shares the same settings
    object (singleton-like behavior without global mutable state).
    """
    return Settings()


# Convenience singleton for straightforward imports: `from app.config import settings`
settings = get_settings()