"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "iOpsData"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # Database
    database_url: str | None = None

    class Config:
        """Pydantic config."""

        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
