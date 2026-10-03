from functools import lru_cache
from pathlib import Path

from pydantic import EmailStr, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", BACKEND_DIR.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "SneakerTown API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://sneakertown:sneakertown@localhost:5432/sneakertown"
    secret_key: str = Field(default="change-me-in-production-use-at-least-32-characters")
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    password_reset_minutes: int = 30
    frontend_url: str = "http://localhost:5173"
    allowed_origins: str = "http://localhost:5173"
    secure_cookies: bool = False
    auto_create_tables: bool = True

    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: EmailStr = "noreply@example.com"
    smtp_starttls: bool = True

    upload_dir: Path = BACKEND_DIR / "uploads"
    max_avatar_bytes: int = 5 * 1024 * 1024

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
