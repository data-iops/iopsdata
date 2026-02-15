"""SQLite connection provider using aiosqlite."""

from __future__ import annotations

from typing import Any

try:
    import aiosqlite
except ImportError:
    aiosqlite = None

from iopsdata.connections.base import DatabaseConnection, QueryResult
from iopsdata.connections.schema_extractor import extract_sqlite_schema


class SQLiteConnection(DatabaseConnection):
    """Async SQLite connection with read-only defaults."""

    def __init__(
        self,
        name: str,
        path: str,
        read_only: bool = True,
        query_timeout_s: int = 30,
        max_rows: int = 500,
    ) -> None:
        if aiosqlite is None:
            raise ImportError("aiosqlite is required for SQLite connections. Install with: pip install aiosqlite")
        super().__init__(name, read_only, query_timeout_s, max_rows)
        self._path = path
        self._conn: aiosqlite.Connection | None = None

    async def connect(self) -> None:
        if self._conn is not None:
            return
        uri = f"file:{self._path}?mode=ro" if self.read_only else self._path
        self._conn = await aiosqlite.connect(uri, uri=self.read_only)
        await self._conn.execute(f"PRAGMA busy_timeout = {int(self.query_timeout_s * 1000)}")

    async def disconnect(self) -> None:
        if self._conn is not None:
            await self._conn.close()
        self._conn = None

    def is_connected(self) -> bool:
        return self._conn is not None

    def pool_status(self) -> dict[str, Any]:
        return {"connected": self._conn is not None}

    async def execute(self, query: str, *args: Any) -> QueryResult:
        if not self._conn:
            raise RuntimeError("Connection not initialized")
        if self.read_only and query.strip().lower().startswith(("insert", "update", "delete", "drop", "alter")):
            raise PermissionError("Read-only connection")

        try:
            cursor = await self._conn.execute(query, args)
            rows = await cursor.fetchmany(self.max_rows)
            columns = [description[0] for description in cursor.description or []]
            await cursor.close()
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"SQLite query failed: {exc}") from exc
        return QueryResult(columns=columns, rows=[tuple(row) for row in rows], row_count=len(rows))

    async def get_schema(self) -> list[dict[str, Any]]:
        if not self._conn:
            raise RuntimeError("Connection not initialized")
        try:
            return await extract_sqlite_schema(self._conn, self.max_rows)
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"SQLite schema extraction failed: {exc}") from exc
