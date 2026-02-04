"""SQL lineage extraction using sqlglot."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import sqlglot
from sqlglot import expressions as exp


@dataclass(frozen=True)
class LineageExtraction:
    """Structured lineage details for a SQL statement."""

    sql: str
    query_type: str
    tables_read: list[str]
    tables_written: list[str]
    columns_used: list[str]
    ctes: list[str]


def _table_name(table: exp.Table) -> str:
    if table.db:
        return f"{table.db}.{table.name}"
    return table.name


def _extract_tables(expression: exp.Expression) -> list[str]:
    return sorted({_table_name(table) for table in expression.find_all(exp.Table)})


def _extract_columns(expression: exp.Expression) -> list[str]:
    columns: set[str] = set()
    for column in expression.find_all(exp.Column):
        if column.table:
            columns.add(f"{column.table}.{column.name}")
        else:
            columns.add(column.name)
    return sorted(columns)


def _extract_ctes(expression: exp.Expression) -> list[str]:
    return sorted({cte.alias_or_name for cte in expression.find_all(exp.CTE) if cte.alias_or_name})


def _query_type(expression: exp.Expression) -> str:
    if isinstance(expression, exp.Select):
        return "SELECT"
    if isinstance(expression, exp.Insert):
        return "INSERT"
    if isinstance(expression, exp.Update):
        return "UPDATE"
    if isinstance(expression, exp.Delete):
        return "DELETE"
    if isinstance(expression, exp.Create):
        return "CREATE"
    return expression.key.upper()


def _written_tables(expression: exp.Expression) -> list[str]:
    targets: set[str] = set()
    if isinstance(expression, (exp.Insert, exp.Update, exp.Delete, exp.Create)):
        target = expression.this
        if isinstance(target, exp.Table):
            targets.add(_table_name(target))
    return sorted(targets)


def extract_lineage(sql: str, dialect: str | None = None) -> LineageExtraction:
    """Extract table/column lineage from SQL using sqlglot."""

    parsed = sqlglot.parse_one(sql, read=dialect) if dialect else sqlglot.parse_one(sql)
    query_type = _query_type(parsed)
    tables = _extract_tables(parsed)
    tables_written = _written_tables(parsed)
    tables_read = sorted(set(tables) - set(tables_written))
    columns_used = _extract_columns(parsed)
    ctes = _extract_ctes(parsed)

    return LineageExtraction(
        sql=sql,
        query_type=query_type,
        tables_read=tables_read,
        tables_written=tables_written,
        columns_used=columns_used,
        ctes=ctes,
    )


def extract_dependencies(sql_statements: Iterable[str], dialect: str | None = None) -> dict[str, list[str]]:
    """Build a dependency map for a list of SQL statements."""

    dependencies: dict[str, list[str]] = {}
    previous_tables: set[str] = set()

    for statement in sql_statements:
        lineage = extract_lineage(statement, dialect=dialect)
        deps = sorted(previous_tables.intersection(set(lineage.tables_read)))
        dependencies[statement] = deps
        previous_tables.update(lineage.tables_written)

    return dependencies
