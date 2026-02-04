"""FastAPI dependencies for iOpsData."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request

from iopsdata.connections.manager import ConnectionManager
from iopsdata.db.supabase import SupabaseClientWrapper, get_supabase_client


@dataclass
class ConnectionManagerProvider:
    """Helper to build a connection manager from a Fernet key."""

    fernet_key: str

    @property
    def manager(self) -> ConnectionManager:
        return ConnectionManager(self.fernet_key)


async def get_supabase() -> SupabaseClientWrapper:
    """Provide a Supabase client wrapper."""

    return await get_supabase_client()


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    supabase: SupabaseClientWrapper = Depends(get_supabase),
) -> dict:
    """Resolve the current Supabase user from a Bearer token."""

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.split(" ", 1)[1]
    client = await supabase._get_client()
    result = await client.auth.get_user(token)
    if not result.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return result.user.model_dump()


def get_connection_manager(request: Request) -> ConnectionManager:
    """Fetch the connection manager from application state."""

    return request.app.state.connection_manager


def get_connection(
    connection_id: str,
    manager: ConnectionManager = Depends(get_connection_manager),
):
    """Get a connection by id or raise 404."""

    connection = manager.get(connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    return connection
