"""Utilities for extracting SQL from LLM responses."""

from __future__ import annotations

import re
from typing import Iterable

SQL_START = re.compile(r"\b(select|with|insert|update|delete)\b", re.IGNORECASE)
CODE_BLOCK = re.compile(r"```(?:sql)?\n(.*?)```", re.DOTALL | re.IGNORECASE)


def _normalize_sql(sql: str) -> str:
    return sql.strip().rstrip(";") + ";"


def _has_balanced_parentheses(sql: str) -> bool:
    balance = 0
    for char in sql:
        if char == "(":
            balance += 1
        elif char == ")":
            balance -= 1
        if balance < 0:
            return False
    return balance == 0


def _is_valid_sql(sql: str) -> bool:
    if not sql or not SQL_START.search(sql):
        return False
    return _has_balanced_parentheses(sql)


def _extract_candidates(text: str) -> Iterable[str]:
    for match in CODE_BLOCK.findall(text):
        yield match
    if SQL_START.search(text):
        yield text


def extract_sql_from_response(text: str) -> str | None:
    """Parse and validate SQL from a model response.

    Handles markdown code blocks, explanations mixed with SQL, and returns
    normalized SQL when valid.
    """

    for candidate in _extract_candidates(text):
        cleaned = candidate.strip()
        if _is_valid_sql(cleaned):
            return _normalize_sql(cleaned)

        # Attempt to extract only the SQL portion from mixed content.
        lines = [line for line in cleaned.splitlines() if SQL_START.search(line)]
        if lines:
            snippet = "\n".join(lines)
            if _is_valid_sql(snippet):
                return _normalize_sql(snippet)

    return None
