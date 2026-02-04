"""Pydantic models for file uploads and profiling."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class FileUpload(BaseModel):
    """Metadata returned after uploading a file to storage."""

    id: UUID | None = None
    workspace_id: UUID | None = None
    file_name: str
    storage_path: str
    content_type: str | None = None
    size_bytes: int
    uploaded_by: UUID | None = None
    created_at: datetime | None = None


class ColumnProfile(BaseModel):
    """Profile statistics for a single column."""

    name: str
    data_type: str
    null_count: int
    distinct_count: int
    sample_values: list[Any] = Field(default_factory=list)
    min_value: Any | None = None
    max_value: Any | None = None
    mean_value: float | None = None
    percentiles: dict[str, float] | None = None
    most_common: list[Any] | None = None
    pii_flag: bool = False


class FileProfile(BaseModel):
    """Profile for an entire file."""

    row_count: int
    column_count: int
    columns: list[ColumnProfile]
    quality_score: float
