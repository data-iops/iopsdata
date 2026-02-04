"""Tests for utility helpers."""

from __future__ import annotations

import pytest

from iopsdata.utils.encryption import decrypt_value, encrypt_value, generate_key
from iopsdata.utils.rate_limit import RateLimiter
from iopsdata.utils.validation import validate_sql_safe


def test_encryption_round_trip() -> None:
    key = generate_key()
    token = encrypt_value("secret", key)
    assert decrypt_value(token, key) == "secret"


def test_validate_sql_safe_blocks_multi_statement() -> None:
    with pytest.raises(ValueError):
        validate_sql_safe("select 1; drop table users")


def test_rate_limiter_allows_then_blocks() -> None:
    limiter = RateLimiter(rate=1, per_seconds=60)
    assert limiter.allow("user") is True
    assert limiter.allow("user") is False
