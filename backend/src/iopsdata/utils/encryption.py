"""Fernet encryption helpers."""

from __future__ import annotations

from cryptography.fernet import Fernet


def generate_key() -> str:
    """Generate a new Fernet key."""

    return Fernet.generate_key().decode("utf-8")


def encrypt_value(value: str, key: str) -> str:
    """Encrypt a string value with a Fernet key."""

    fernet = Fernet(key)
    return fernet.encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt_value(token: str, key: str) -> str:
    """Decrypt a token with a Fernet key."""

    fernet = Fernet(key)
    return fernet.decrypt(token.encode("utf-8")).decode("utf-8")
