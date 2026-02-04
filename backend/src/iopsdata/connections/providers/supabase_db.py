"""Supabase direct database connection provider."""

from __future__ import annotations

from iopsdata.connections.providers.postgres import PostgresConnection


class SupabaseConnection(PostgresConnection):
    """Supabase uses a PostgreSQL database; inherits asyncpg implementation."""

    def __init__(
        self,
        name: str,
        dsn: str,
        read_only: bool = True,
        query_timeout_s: int = 30,
        max_rows: int = 500,
    ) -> None:
        super().__init__(
            name=name,
            dsn=dsn,
            read_only=read_only,
            query_timeout_s=query_timeout_s,
            max_rows=max_rows,
        )
