"""Connection manager for database providers."""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Any

from cryptography.fernet import Fernet

from iopsdata.connections.base import DatabaseConnection
from iopsdata.connections.providers.duckdb import DuckDBConnection
from iopsdata.connections.providers.mysql import MySQLConnection
from iopsdata.connections.providers.postgres import PostgresConnection
from iopsdata.connections.providers.sqlite import SQLiteConnection
from iopsdata.connections.providers.supabase_db import SupabaseConnection


@dataclass
class CachedSchema:
    """Schema cache entry with TTL."""

    schema: list[dict[str, Any]]
    expires_at: float


class ConnectionManager:
    """Store and manage active database connections."""

    def __init__(self, fernet_key: str, schema_ttl_s: int = 900) -> None:
        self._fernet = Fernet(fernet_key)
        self._connections: dict[str, DatabaseConnection] = {}
        self._schema_cache: dict[str, CachedSchema] = {}
        self._schema_ttl_s = schema_ttl_s

    def encrypt_credentials(self, credentials: dict[str, Any]) -> str:
        payload = json.dumps(credentials).encode("utf-8")
        return self._fernet.encrypt(payload).decode("utf-8")

    def decrypt_credentials(self, token: str) -> dict[str, Any]:
        payload = self._fernet.decrypt(token.encode("utf-8")).decode("utf-8")
        return json.loads(payload)

    def register(self, name: str, connection: DatabaseConnection) -> None:
        self._connections[name] = connection

    def get(self, name: str) -> DatabaseConnection | None:
        return self._connections.get(name)

    async def disconnect(self, name: str) -> None:
        connection = self._connections.get(name)
        if connection:
            await connection.disconnect()
            self._connections.pop(name, None)
            self._schema_cache.pop(name, None)

    async def health_check(self, name: str) -> bool:
        connection = self._connections.get(name)
        if not connection:
            return False
        return connection.is_connected()

    async def schema_for(self, name: str) -> list[dict[str, Any]]:
        cached = self._schema_cache.get(name)
        if cached and cached.expires_at > time.time():
            return cached.schema

        connection = self._connections.get(name)
        if not connection:
            raise RuntimeError("Connection not registered")

        schema = await connection.get_schema()
        self._schema_cache[name] = CachedSchema(schema=schema, expires_at=time.time() + self._schema_ttl_s)
        return schema

    def create_connection(self, provider: str, name: str, **kwargs: Any) -> DatabaseConnection:
        provider = provider.lower()
        if provider == "postgres":
            return PostgresConnection(name=name, **kwargs)
        if provider == "mysql":
            return MySQLConnection(name=name, **kwargs)
        if provider == "sqlite":
            return SQLiteConnection(name=name, **kwargs)
        if provider == "duckdb":
            return DuckDBConnection(name=name, **kwargs)
        if provider == "supabase":
            return SupabaseConnection(name=name, **kwargs)
        raise ValueError(f"Unsupported provider: {provider}")
