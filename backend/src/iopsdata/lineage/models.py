"""Pydantic models for SQL lineage data."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class LineageQuery(BaseModel):
    """Normalized lineage metadata extracted from a SQL statement."""

    sql: str
    query_type: str
    tables_read: list[str] = Field(default_factory=list)
    tables_written: list[str] = Field(default_factory=list)
    columns_used: list[str] = Field(default_factory=list)
    ctes: list[str] = Field(default_factory=list)


class LineageRecord(BaseModel):
    """Lineage record tracked within a session."""

    id: UUID | None = None
    session_id: str
    created_at: datetime
    query: LineageQuery
    dependencies: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
