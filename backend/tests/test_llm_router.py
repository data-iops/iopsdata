"""Tests for LLM router utilities."""

from __future__ import annotations

import os

from iopsdata.llm.router import configured_providers, get_provider


def test_get_provider_returns_instance() -> None:
    provider = get_provider("groq")
    assert provider.name == "groq"


def test_configured_providers_includes_ollama() -> None:
    providers = configured_providers()
    assert "ollama" in providers


def test_configured_providers_respects_env(monkeypatch) -> None:
    monkeypatch.setenv("GROQ_API_KEY", "test")
    providers = configured_providers()
    assert "groq" in providers
