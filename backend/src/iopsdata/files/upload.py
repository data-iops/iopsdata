"""File upload helpers for Supabase Storage."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from iopsdata.files.models import FileUpload

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".parquet", ".json"}
MAX_FILE_SIZE_BYTES = 1024 * 1024 * 200  # 200MB


def _validate_file(path: Path, max_size: int) -> None:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    if path.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {path.suffix}")
    size = path.stat().st_size
    if size > max_size:
        raise ValueError(f"File exceeds max size of {max_size} bytes")


def _detect_content_type(path: Path) -> str:
    mapping = {
        ".csv": "text/csv",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls": "application/vnd.ms-excel",
        ".parquet": "application/octet-stream",
        ".json": "application/json",
    }
    return mapping.get(path.suffix.lower(), "application/octet-stream")


async def _maybe_await(result: Any) -> Any:
    if asyncio.iscoroutine(result):
        return await result
    return result


async def upload_file_to_supabase(
    supabase_client: Any,
    file_path: str | Path,
    bucket: str,
    destination_path: str | None = None,
    max_size_bytes: int = MAX_FILE_SIZE_BYTES,
) -> FileUpload:
    """Upload a file to Supabase Storage and return metadata."""

    path = Path(file_path)
    _validate_file(path, max_size_bytes)
    destination = destination_path or path.name

    content_type = _detect_content_type(path)
    payload = path.read_bytes()

    storage = supabase_client.storage.from_(bucket)
    response = await _maybe_await(storage.upload(destination, payload, {"content-type": content_type}))

    if isinstance(response, dict) and response.get("error"):
        raise RuntimeError(f"Supabase upload failed: {response['error']}")

    return FileUpload(
        file_name=path.name,
        storage_path=destination,
        content_type=content_type,
        size_bytes=path.stat().st_size,
    )
