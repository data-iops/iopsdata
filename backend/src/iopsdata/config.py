"""Application configuration settings."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Base settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: str = Field(default="dev", validation_alias="APP_ENV")
    app_name: str = Field(default="iOpsData", validation_alias="APP_NAME")
    debug: bool = Field(default=False, validation_alias="DEBUG")

    supabase_url: str = Field(..., validation_alias="SUPABASE_URL")
    supabase_anon_key: str = Field(..., validation_alias="SUPABASE_ANON_KEY")
    fernet_key: str = Field(..., validation_alias="FERNET_KEY")

    cors_origins: str = Field(default="*", validation_alias="CORS_ORIGINS")


class DevSettings(Settings):
    """Development settings."""

    debug: bool = True


class ProdSettings(Settings):
    """Production settings."""

    debug: bool = False


@lru_cache
def get_settings() -> Settings:
    """Return cached settings based on APP_ENV."""

    env = (Settings().app_env or "dev").lower()
    if env == "prod":
        return ProdSettings()
    return DevSettings()
