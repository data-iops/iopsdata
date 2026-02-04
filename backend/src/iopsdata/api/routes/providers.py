"""LLM provider routes."""

from __future__ import annotations

from fastapi import APIRouter

from iopsdata.llm.router import configured_providers

router = APIRouter(tags=["providers"])


@router.get("/providers")
async def list_providers() -> dict[str, list[str]]:
    """List configured LLM providers."""

    return {"providers": configured_providers()}
