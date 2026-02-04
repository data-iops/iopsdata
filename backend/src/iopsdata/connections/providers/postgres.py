"""PostgreSQL connection provider using asyncpg."""

from __future__ import annotations

from typing import Any

import asyncpg

from iopsdata.connections.base import DatabaseConnection, QueryResult
from iopsdata.connections.schema_extractor import extract_postgres_schema


class PostgresConnection(DatabaseConnection):
    """Async PostgreSQL connection with pooling and read-only defaults."""

    def __init__(
        self,
        name: str,
        dsn: str,
        read_only: bool = True,
        query_timeout_s: int = 30,
        max_rows: int = 500,
    ) -> None:
        super().__init__(name, read_only, query_timeout_s, max_rows)
        self._dsn = dsn
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        if self._pool is not None:
            return
        self._pool = await asyncpg.create_pool(dsn=self._dsn, timeout=self.query_timeout_s)

    async def disconnect(self) -> None:
        if self._pool is not None:
            await self._pool.close()
        self._pool = None

    def is_connected(self) -> bool:
        return self._pool is not None

    def pool_status(self) -> dict[str, Any]:
        if not self._pool:
            return {"connected": False}
        return {
            "connected": True,
            "size": self._pool.get_size(),
            "free": self._pool.get_idle_size(),
        }

    async def execute(self, query: str, *args: Any) -> QueryResult:
        if not self._pool:
            raise RuntimeError("Connection pool not initialized")
        if self.read_only and query.strip().lower().startswith(("insert", "update", "delete", "drop", "alter")):
            raise PermissionError("Read-only connection")

        try:
            async with self._pool.acquire() as conn:
                await conn.execute("SET statement_timeout TO $1", int(self.query_timeout_s * 1000))
                if self.read_only:
                    await conn.execute("SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY")
                records = await conn.fetch(query, *args)
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"PostgreSQL query failed: {exc}") from exc

        rows = [tuple(record.values()) for record in records][: self.max_rows]
        columns = list(records[0].keys()) if records else []
        return QueryResult(columns=columns, rows=rows, row_count=len(rows))

    async def get_schema(self) -> list[dict[str, Any]]:
        if not self._pool:
            raise RuntimeError("Connection pool not initialized")
        try:
            async with self._pool.acquire() as conn:
                return await extract_postgres_schema(conn, self.max_rows)
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"PostgreSQL schema extraction failed: {exc}") from exc
