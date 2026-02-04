"""Async Supabase client wrapper and helpers."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx
from supabase import AsyncClient, create_async_client


@dataclass
class SupabaseConfig:
    """Configuration required to connect to Supabase."""

    url: str
    anon_key: str
    max_connections: int = 50
    max_keepalive_connections: int = 10
    timeout_seconds: int = 30


class SupabaseClientWrapper:
    """Thin wrapper around the Supabase async client with pooling and helpers."""

    def __init__(self, config: SupabaseConfig) -> None:
        self._config = config
        self._client: AsyncClient | None = None
        self._http_client: httpx.AsyncClient | None = None

    async def init(self) -> AsyncClient:
        """Initialize the async Supabase client with connection pooling."""

        if self._client is not None:
            return self._client

        limits = httpx.Limits(
            max_connections=self._config.max_connections,
            max_keepalive_connections=self._config.max_keepalive_connections,
        )
        self._http_client = httpx.AsyncClient(
            timeout=self._config.timeout_seconds,
            limits=limits,
        )
        self._client = await create_async_client(
            self._config.url,
            self._config.anon_key,
            httpx_client=self._http_client,
        )
        return self._client

    async def close(self) -> None:
        """Close the underlying HTTP client."""

        if self._http_client is not None:
            await self._http_client.aclose()
        self._client = None
        self._http_client = None

    async def _get_client(self) -> AsyncClient:
        if self._client is None:
            await self.init()
        if self._client is None:
            raise RuntimeError("Supabase client was not initialized")
        return self._client

    async def fetch_workspace(self, workspace_id: str) -> dict[str, Any] | None:
        """Fetch a workspace by ID."""

        client = await self._get_client()
        response = await client.table("workspaces").select("*").eq("id", workspace_id).execute()
        if response.data:
            return response.data[0]
        return None

    async def list_connections(self, workspace_id: str) -> list[dict[str, Any]]:
        """List data source connections for a workspace."""

        client = await self._get_client()
        response = await client.table("connections").select("*").eq("workspace_id", workspace_id).execute()
        return list(response.data or [])

    async def insert_message(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Insert a message row and return the inserted record."""

        client = await self._get_client()
        response = await client.table("messages").insert(payload).execute()
        if not response.data:
            raise RuntimeError("Failed to insert message")
        return response.data[0]

    async def log_query_history(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Insert a query history entry and return the inserted record."""

        client = await self._get_client()
        response = await client.table("query_history").insert(payload).execute()
        if not response.data:
            raise RuntimeError("Failed to insert query history")
        return response.data[0]

    async def upsert_user_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Upsert user settings by user_id."""

        client = await self._get_client()
        response = (
            await client.table("user_settings")
            .upsert(payload, on_conflict="user_id")
            .execute()
        )
        if not response.data:
            raise RuntimeError("Failed to upsert user settings")
        return response.data[0]


def build_supabase_config() -> SupabaseConfig:
    """Build Supabase configuration from environment variables."""

    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not anon_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")

    return SupabaseConfig(
        url=url,
        anon_key=anon_key,
        max_connections=int(os.getenv("SUPABASE_MAX_CONNECTIONS", "50")),
        max_keepalive_connections=int(os.getenv("SUPABASE_MAX_KEEPALIVE", "10")),
        timeout_seconds=int(os.getenv("SUPABASE_TIMEOUT", "30")),
    )


async def get_supabase_client() -> SupabaseClientWrapper:
    """Convenience helper to build and initialize the Supabase client wrapper."""

    wrapper = SupabaseClientWrapper(build_supabase_config())
    await wrapper.init()
    return wrapper
