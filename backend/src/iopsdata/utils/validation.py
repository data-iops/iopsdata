"""Validation helpers for SQL safety checks."""

from __future__ import annotations

import re

FORBIDDEN = re.compile(r"\b(drop|alter|truncate)\b", re.IGNORECASE)
MULTI_STATEMENT = re.compile(r";\s*\S+", re.DOTALL)


def validate_sql_safe(sql: str, read_only: bool = True) -> None:
    """Basic SQL safety checks to mitigate injection and destructive queries."""

    statement = sql.strip()
    if MULTI_STATEMENT.search(statement):
        raise ValueError("Multiple statements are not allowed")
    if FORBIDDEN.search(statement):
        raise ValueError("Destructive SQL statements are not allowed")
    if read_only and statement.lower().startswith(("insert", "update", "delete")):
        raise ValueError("Write operations are not allowed in read-only mode")
