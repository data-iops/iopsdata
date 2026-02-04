"""File upload and profiling routes."""

from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile

from iopsdata.api.dependencies import get_supabase
from iopsdata.api.schemas import FileUploadResponse
from iopsdata.db.supabase import SupabaseClientWrapper
from iopsdata.files.profiler import profile_file
from iopsdata.files.upload import upload_file_to_supabase

router = APIRouter(tags=["files"])


@router.post("/files/upload", response_model=FileUploadResponse)
async def upload_file(
    bucket: str,
    file: UploadFile = File(...),
    supabase: SupabaseClientWrapper = Depends(get_supabase),
) -> FileUploadResponse:
    """Upload a file to Supabase storage."""

    suffix = Path(file.filename or "upload").suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    result = await upload_file_to_supabase(supabase, tmp_path, bucket)
    return FileUploadResponse(
        file_name=result.file_name,
        storage_path=result.storage_path,
        content_type=result.content_type,
        size_bytes=result.size_bytes,
    )


@router.post("/files/profile")
async def profile_uploaded_file(file: UploadFile = File(...)) -> dict:
    """Profile an uploaded file locally using DuckDB."""

    suffix = Path(file.filename or "upload").suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    profile = profile_file(tmp_path)
    return profile.model_dump()
