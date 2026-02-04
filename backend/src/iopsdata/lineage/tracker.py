"""Session-based lineage tracking and persistence."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Protocol

from iopsdata.db.supabase import SupabaseClientWrapper
from iopsdata.lineage.models import LineageQuery, LineageRecord
from iopsdata.lineage.parser import LineageExtraction, extract_lineage


class LineageStore(Protocol):
    """Persistence interface for lineage records."""

    async def save(self, record: LineageRecord) -> None:  # pragma: no cover - protocol
        ...

    async def list(self, session_id: str) -> list[LineageRecord]:  # pragma: no cover - protocol
        ...


@dataclass
class InMemoryLineageStore:
    """In-memory lineage store for development/testing."""

    _records: list[LineageRecord]

    async def save(self, record: LineageRecord) -> None:
        self._records.append(record)

    async def list(self, session_id: str) -> list[LineageRecord]:
        return [record for record in self._records if record.session_id == session_id]


class SupabaseLineageStore:
    """Supabase-backed lineage store.

    The default table name assumes a `lineage_events` table with JSONB columns.
    """

    def __init__(self, client: SupabaseClientWrapper, table_name: str = "lineage_events") -> None:
        self._client = client
        self._table = table_name

    async def save(self, record: LineageRecord) -> None:
        payload = {
            "session_id": record.session_id,
            "created_at": record.created_at.isoformat(),
            "query": record.query.model_dump(),
            "dependencies": record.dependencies,
            "metadata": record.metadata,
        }
        client = await self._client._get_client()
        response = await client.table(self._table).insert(payload).execute()
        if response.data is None:
            raise RuntimeError("Failed to persist lineage record")

    async def list(self, session_id: str) -> list[LineageRecord]:
        client = await self._client._get_client()
        response = (
            await client.table(self._table)
            .select("*")
            .eq("session_id", session_id)
            .order("created_at", desc=True)
            .execute()
        )
        records: list[LineageRecord] = []
        for item in response.data or []:
            records.append(
                LineageRecord(
                    id=item.get("id"),
                    session_id=item["session_id"],
                    created_at=datetime.fromisoformat(item["created_at"]),
                    query=LineageQuery(**item["query"]),
                    dependencies=item.get("dependencies", []),
                    metadata=item.get("metadata", {}),
                )
            )
        return records


class LineageTracker:
    """Track SQL queries and persist lineage per session."""

    def __init__(self, session_id: str, store: LineageStore | None = None) -> None:
        self.session_id = session_id
        self._store = store or InMemoryLineageStore([])
        self._queries: list[LineageExtraction] = []

    async def track(self, sql: str, dialect: str | None = None, metadata: dict[str, Any] | None = None) -> LineageRecord:
        """Parse SQL, update dependencies, and persist lineage."""

        extraction = extract_lineage(sql, dialect=dialect)
        dependencies = self._resolve_dependencies(extraction)
        record = LineageRecord(
            session_id=self.session_id,
            created_at=datetime.now(timezone.utc),
            query=LineageQuery(
                sql=extraction.sql,
                query_type=extraction.query_type,
                tables_read=extraction.tables_read,
                tables_written=extraction.tables_written,
                columns_used=extraction.columns_used,
                ctes=extraction.ctes,
            ),
            dependencies=dependencies,
            metadata=metadata or {},
        )
        await self._store.save(record)
        self._queries.append(extraction)
        return record

    async def history(self) -> list[LineageRecord]:
        """Return lineage history for this session."""

        return await self._store.list(self.session_id)

    def _resolve_dependencies(self, extraction: LineageExtraction) -> list[str]:
        dependencies: set[str] = set()
        written_tables = {table for item in self._queries for table in item.tables_written}
        dependencies.update(written_tables.intersection(set(extraction.tables_read)))
        return sorted(dependencies)
