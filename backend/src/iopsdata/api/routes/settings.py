"""User settings routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from iopsdata.api.dependencies import get_current_user, get_supabase
from iopsdata.api.schemas import UserSettingsResponse
from iopsdata.db.supabase import SupabaseClientWrapper

router = APIRouter(tags=["settings"])


@router.get("/settings", response_model=UserSettingsResponse)
async def get_settings(
    user: dict = Depends(get_current_user),
    supabase: SupabaseClientWrapper = Depends(get_supabase),
) -> UserSettingsResponse:
    """Return settings for the current user."""

    client = await supabase._get_client()
    response = await client.table("user_settings").select("settings").eq("user_id", user["id"]).execute()
    settings = response.data[0]["settings"] if response.data else {}
    return UserSettingsResponse(user_id=user["id"], settings=settings)
