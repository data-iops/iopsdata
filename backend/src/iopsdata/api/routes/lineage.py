"""Lineage routes."""

from __future__ import annotations

from fastapi import APIRouter

from iopsdata.api.schemas import LineageRequest, LineageResponse
from iopsdata.lineage.parser import extract_lineage

router = APIRouter(tags=["lineage"])


@router.post("/lineage", response_model=LineageResponse)
async def parse_lineage(payload: LineageRequest) -> LineageResponse:
    """Parse SQL and return lineage metadata."""

    extraction = extract_lineage(payload.sql, dialect=payload.dialect)
    return LineageResponse(
        query_type=extraction.query_type,
        tables_read=extraction.tables_read,
        tables_written=extraction.tables_written,
        columns_used=extraction.columns_used,
        ctes=extraction.ctes,
    )
