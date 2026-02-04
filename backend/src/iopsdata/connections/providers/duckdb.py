"""DuckDB connection provider for local file-based analytics."""

from __future__ import annotations

from typing import Any

import duckdb

from iopsdata.connections.base import DatabaseConnection, QueryResult
from iopsdata.connections.schema_extractor import extract_duckdb_schema


class DuckDBConnection(DatabaseConnection):
    """DuckDB connection wrapper with read-only defaults."""

    def __init__(
        self,
        name: str,
        path: str,
        read_only: bool = True,
        query_timeout_s: int = 30,
        max_rows: int = 500,
    ) -> None:
        super().__init__(name, read_only, query_timeout_s, max_rows)
        self._path = path
        self._conn: duckdb.DuckDBPyConnection | None = None

    async def connect(self) -> None:
        if self._conn is not None:
            return
        self._conn = duckdb.connect(self._path, read_only=self.read_only)
        self._conn.execute(f"SET statement_timeout={int(self.query_timeout_s * 1000)}")

    async def disconnect(self) -> None:
        if self._conn is not None:
            self._conn.close()
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
            result = self._conn.execute(query, args)
            rows = result.fetchmany(self.max_rows)
            columns = [col[0] for col in result.description or []]
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"DuckDB query failed: {exc}") from exc
        return QueryResult(columns=columns, rows=[tuple(row) for row in rows], row_count=len(rows))

    async def get_schema(self) -> list[dict[str, Any]]:
        if not self._conn:
            raise RuntimeError("Connection not initialized")
        try:
            return await extract_duckdb_schema(self._conn, self.max_rows)
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"DuckDB schema extraction failed: {exc}") from exc
