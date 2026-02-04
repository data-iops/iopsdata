"""Tests for configuration settings."""

from __future__ import annotations

import os

import pytest

from iopsdata.config import DevSettings, ProdSettings


def test_dev_settings_defaults(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "dev")
    settings = DevSettings(
        SUPABASE_URL="https://example.supabase.co",
        SUPABASE_ANON_KEY="key",
        FERNET_KEY="key",
    )
    assert settings.debug is True


def test_prod_settings_defaults(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "prod")
    settings = ProdSettings(
        SUPABASE_URL="https://example.supabase.co",
        SUPABASE_ANON_KEY="key",
        FERNET_KEY="key",
    )
    assert settings.debug is False


def test_settings_requires_keys(monkeypatch) -> None:
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    with pytest.raises(Exception):
        DevSettings(SUPABASE_ANON_KEY="key", FERNET_KEY="key")
