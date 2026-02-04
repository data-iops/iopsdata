"""API request/response schemas."""

from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request payload for /api/chat."""

    connection_id: str
    prompt: str
    provider: str | None = None
    auto_execute: bool = False
    dialect: str | None = None


class QueryResultPayload(BaseModel):
    """Normalized query result payload."""

    columns: list[str]
    rows: list[list[Any]]
    row_count: int


class ChatResponse(BaseModel):
    """Response payload for /api/chat."""

    sql: str
    provider: str
    model: str
    tokens: dict[str, int | None]
    results: QueryResultPayload | None = None


class ExecuteRequest(BaseModel):
    """Request payload for /api/execute."""

    connection_id: str
    sql: str


class ExecuteResponse(BaseModel):
    """Response payload for /api/execute."""

    results: QueryResultPayload


class ConnectionCreate(BaseModel):
    """Create a new connection."""

    provider: str
    name: str
    config: dict[str, Any] = Field(default_factory=dict)


class ConnectionResponse(BaseModel):
    """Connection metadata response."""

    name: str
    provider: str
    status: dict[str, Any]


class FileUploadResponse(BaseModel):
    """File upload response payload."""

    file_name: str
    storage_path: str
    content_type: str | None = None
    size_bytes: int


class LineageRequest(BaseModel):
    """Request payload for lineage parsing."""

    sql: str
    dialect: str | None = None


class LineageResponse(BaseModel):
    """Response payload for lineage parsing."""

    query_type: str
    tables_read: list[str]
    tables_written: list[str]
    columns_used: list[str]
    ctes: list[str]


class UserSettingsResponse(BaseModel):
    """User settings response payload."""

    user_id: UUID
    settings: dict[str, Any]
