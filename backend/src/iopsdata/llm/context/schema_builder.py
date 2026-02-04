"""Schema context builder for LLM prompts."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ColumnSpec:
    """Structured column metadata for schema context."""

    name: str
    data_type: str
    is_nullable: bool = True
    is_primary_key: bool = False
    is_foreign_key: bool = False
    references: str | None = None
    sample_values: list[str] | None = None


@dataclass(frozen=True)
class TableSpec:
    """Structured table metadata for schema context."""

    name: str
    description: str | None
    columns: list[ColumnSpec]
    relationships: list[str] | None = None


def _dialect_hints(dialect: str) -> str:
    hints = {
        "postgresql": "Use PostgreSQL syntax, double quotes for identifiers, and ILIKE for case-insensitive matches.",
        "postgres": "Use PostgreSQL syntax, double quotes for identifiers, and ILIKE for case-insensitive matches.",
        "mysql": "Use MySQL syntax, backticks for identifiers, and LIMIT for pagination.",
        "bigquery": "Use BigQuery Standard SQL with backticks for identifiers and QUALIFY for window filters.",
        "snowflake": "Use Snowflake SQL, double quotes for identifiers, and QUALIFY for window filters.",
    }
    return hints.get(dialect.lower(), "Use ANSI SQL syntax with explicit JOINs and clear aliases.")


def _score_tables(tables: list[TableSpec], recent_queries: list[str]) -> dict[str, int]:
    query_text = "\n".join(recent_queries).lower()
    scores: Counter[str] = Counter()
    for table in tables:
        score = 1
        if table.name.lower() in query_text:
            score += 5
        if table.relationships:
            score += len(table.relationships)
        scores[table.name] = score
    return dict(scores)


def _compress_schema(tables: list[TableSpec], recent_queries: list[str], max_tables: int) -> list[TableSpec]:
    if len(tables) <= max_tables:
        return tables
    scores = _score_tables(tables, recent_queries)
    return sorted(tables, key=lambda table: scores.get(table.name, 0), reverse=True)[:max_tables]


def build_schema_context(
    tables: list[TableSpec],
    recent_queries: list[str] | None = None,
    dialect: str = "postgresql",
    max_tables: int = 25,
) -> str:
    """Build a schema context string for LLM prompts.

    Includes table/column metadata, relationships, sample categorical values,
    recent queries for continuity, dialect-specific guidance, and compression
    for large schemas.
    """

    recent_queries = recent_queries or []
    tables = _compress_schema(tables, recent_queries, max_tables)

    lines: list[str] = []
    lines.append("Schema Context:")
    lines.append(_dialect_hints(dialect))
    lines.append("")

    for table in tables:
        description = f" - {table.description}" if table.description else ""
        lines.append(f"Table: {table.name}{description}")
        if table.relationships:
            lines.append(f"  Relationships: {', '.join(table.relationships)}")
        for column in table.columns:
            extras: list[str] = []
            if column.is_primary_key:
                extras.append("PK")
            if column.is_foreign_key and column.references:
                extras.append(f"FK->{column.references}")
            if not column.is_nullable:
                extras.append("NOT NULL")
            if column.sample_values:
                sample_values = ", ".join(column.sample_values[:5])
                extras.append(f"samples: {sample_values}")
            extras_text = f" ({'; '.join(extras)})" if extras else ""
            lines.append(f"  - {column.name}: {column.data_type}{extras_text}")
        lines.append("")

    if recent_queries:
        lines.append("Recent Queries:")
        for query in recent_queries[-5:]:
            lines.append(f"- {query.strip()}")

    return "\n".join(lines).strip()


def table_from_dict(table: dict[str, Any]) -> TableSpec:
    """Convert a dictionary payload into a TableSpec instance."""

    columns: list[ColumnSpec] = []
    for column in table.get("columns", []):
        columns.append(
            ColumnSpec(
                name=column["name"],
                data_type=column.get("type", "text"),
                is_nullable=column.get("nullable", True),
                is_primary_key=column.get("primary_key", False),
                is_foreign_key=column.get("foreign_key", False),
                references=column.get("references"),
                sample_values=column.get("sample_values"),
            )
        )

    return TableSpec(
        name=table["name"],
        description=table.get("description"),
        columns=columns,
        relationships=table.get("relationships"),
    )
