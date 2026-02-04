"""Pydantic models that mirror the Supabase schema."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class Workspace(BaseModel):
    """Tenant container for all workspace-scoped data."""

    id: UUID
    name: str
    slug: str | None = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class WorkspaceMember(BaseModel):
    """Membership entry linking a user to a workspace."""

    id: UUID
    workspace_id: UUID
    user_id: UUID
    role: Literal["owner", "admin", "member"] = "member"
    created_at: datetime
    updated_at: datetime


class Connection(BaseModel):
    """External data source connection details."""

    id: UUID
    workspace_id: UUID
    name: str
    connection_type: str
    credentials: dict[str, Any]
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class Conversation(BaseModel):
    """Chat conversation thread within a workspace."""

    id: UUID
    workspace_id: UUID
    title: str | None = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class Message(BaseModel):
    """Chat message with optional SQL attached."""

    id: UUID
    workspace_id: UUID
    conversation_id: UUID
    role: str
    content: str
    sql_query: str | None = None
    created_at: datetime
    updated_at: datetime


class UploadedFile(BaseModel):
    """Metadata for a user-uploaded file stored in object storage."""

    id: UUID
    workspace_id: UUID
    file_name: str
    storage_path: str
    content_type: str | None = None
    size_bytes: int | None = None
    uploaded_by: UUID
    created_at: datetime
    updated_at: datetime


class QueryHistory(BaseModel):
    """Executed SQL statement metadata used for lineage and auditing."""

    id: UUID
    workspace_id: UUID
    connection_id: UUID | None = None
    user_id: UUID
    sql_query: str
    executed_at: datetime
    duration_ms: int | None = None
    rows_returned: int | None = None
    status: str = "success"
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime


class UserSettings(BaseModel):
    """Per-user settings and default workspace preferences."""

    id: UUID
    user_id: UUID
    default_workspace_id: UUID | None = None
    settings: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
