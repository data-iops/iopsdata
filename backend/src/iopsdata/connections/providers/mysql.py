"""MySQL connection provider using aiomysql."""

from __future__ import annotations

from typing import Any

try:
    import aiomysql
except ImportError:
    aiomysql = None

from iopsdata.connections.base import DatabaseConnection, QueryResult
from iopsdata.connections.schema_extractor import extract_mysql_schema


class MySQLConnection(DatabaseConnection):
    """Async MySQL connection with pooling and read-only defaults."""

    def __init__(
        self,
        name: str,
        host: str,
        port: int,
        user: str,
        password: str,
        database: str,
        read_only: bool = True,
        query_timeout_s: int = 30,
        max_rows: int = 500,
    ) -> None:
        if aiomysql is None:
            raise ImportError("aiomysql is required for MySQL connections. Install with: pip install aiomysql")
        super().__init__(name, read_only, query_timeout_s, max_rows)
        self._pool: aiomysql.Pool | None = None
        self._config = {
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "db": database,
            "autocommit": True,
        }

    async def connect(self) -> None:
        if self._pool is not None:
            return
        self._pool = await aiomysql.create_pool(**self._config)

    async def disconnect(self) -> None:
        if self._pool is not None:
            self._pool.close()
            await self._pool.wait_closed()
        self._pool = None

    def is_connected(self) -> bool:
        return self._pool is not None

    def pool_status(self) -> dict[str, Any]:
        if not self._pool:
            return {"connected": False}
        return {
            "connected": True,
            "size": self._pool.size,
            "free": self._pool.freesize,
        }

    async def execute(self, query: str, *args: Any) -> QueryResult:
        if not self._pool:
            raise RuntimeError("Connection pool not initialized")
        if self.read_only and query.strip().lower().startswith(("insert", "update", "delete", "drop", "alter")):
            raise PermissionError("Read-only connection")

        try:
            async with self._pool.acquire() as conn:
                async with conn.cursor() as cursor:
                    await cursor.execute(f"SET SESSION MAX_EXECUTION_TIME={int(self.query_timeout_s * 1000)}")
                    if self.read_only:
                        await cursor.execute("SET SESSION TRANSACTION READ ONLY")
                    await cursor.execute(query, args)
                    rows = await cursor.fetchmany(self.max_rows)
                    columns = [desc[0] for desc in cursor.description or []]
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"MySQL query failed: {exc}") from exc

        return QueryResult(columns=columns, rows=[tuple(row) for row in rows], row_count=len(rows))

    async def get_schema(self) -> list[dict[str, Any]]:
        if not self._pool:
            raise RuntimeError("Connection pool not initialized")
        if aiomysql is None:
            raise ImportError("aiomysql is required for MySQL connections")
        try:
            async with self._pool.acquire() as conn:
                async with conn.cursor(aiomysql.DictCursor) as cursor:
                    return await extract_mysql_schema(cursor, self.max_rows)
        except Exception as exc:  # pragma: no cover - defensive wrapper
            raise RuntimeError(f"MySQL schema extraction failed: {exc}") from exc
