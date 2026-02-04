"""API routes."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def api_status() -> dict[str, str]:
    """API status endpoint."""
    return {"status": "ok", "version": "0.1.0"}
