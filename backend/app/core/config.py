from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    FRONTEND_URL: str = ""
    DATABASE_URL: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    UPLOAD_DIR: str = "uploads"
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def frontend_origins(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.FRONTEND_URL.split(",")
            if origin.strip()
        ]

    def validate_runtime(self) -> None:
        env_name = (self.APP_ENV or "development").lower()
        if not self.DATABASE_URL and env_name == "production":
            raise RuntimeError(
                "DATABASE_URL must be configured for production deployment."
            )
        if env_name == "production" and not self.frontend_origins:
            raise RuntimeError(
                "FRONTEND_URL must include the deployed frontend origin when APP_ENV=production."
            )


settings = Settings()