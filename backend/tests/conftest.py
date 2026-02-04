"""Pytest fixtures for iOpsData."""

from __future__ import annotations

import os
from pathlib import Path

import pytest


def _write_csv(path: Path) -> None:
    path.write_text("id,value\n1,10\n2,20\n3,\n")


@pytest.fixture()
def sample_csv(tmp_path: Path) -> Path:
    """Create a sample CSV file for tests."""

    path = tmp_path / "sample.csv"
    _write_csv(path)
    return path


@pytest.fixture(autouse=True)
def env_vars(monkeypatch: pytest.MonkeyPatch) -> None:
    """Set baseline environment variables for tests."""

    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test_key")
    monkeypatch.setenv("FERNET_KEY", "ZmFrZV9mZXJuZXRfa2V5X2Zvcl90ZXN0")
    monkeypatch.setenv("APP_ENV", "dev")
