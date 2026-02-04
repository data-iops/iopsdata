"""Authentication routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from iopsdata.api.dependencies import get_current_user

router = APIRouter(tags=["auth"])


@router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)) -> dict:
    """Return the current authenticated user."""

    return user
