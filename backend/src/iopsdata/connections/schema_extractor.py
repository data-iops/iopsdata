"""Schema extraction utilities for supported databases."""

from __future__ import annotations

from typing import Any


async def extract_postgres_schema(conn: Any, sample_limit: int) -> list[dict[str, Any]]:
    """Extract schema metadata from PostgreSQL."""

    tables_query = """
        select table_schema, table_name
        from information_schema.tables
        where table_type = 'BASE TABLE' and table_schema not in ('pg_catalog', 'information_schema')
        order by table_schema, table_name
    """
    columns_query = """
        select table_schema, table_name, column_name, data_type, is_nullable
        from information_schema.columns
        where table_schema = $1 and table_name = $2
        order by ordinal_position
    """
    fk_query = """
        select kcu.table_name, kcu.column_name, ccu.table_name as foreign_table, ccu.column_name as foreign_column
        from information_schema.table_constraints tc
        join information_schema.key_column_usage kcu
            on tc.constraint_name = kcu.constraint_name
        join information_schema.constraint_column_usage ccu
            on ccu.constraint_name = tc.constraint_name
        where tc.constraint_type = 'FOREIGN KEY'
          and tc.table_schema = $1
          and tc.table_name = $2
    """

    tables = await conn.fetch(tables_query)
    results: list[dict[str, Any]] = []
    for table in tables:
        schema_name = table["table_schema"]
        table_name = table["table_name"]
        columns = await conn.fetch(columns_query, schema_name, table_name)
        fks = await conn.fetch(fk_query, schema_name, table_name)
        fk_map = {
            (fk["table_name"], fk["column_name"]): f"{fk['foreign_table']}.{fk['foreign_column']}"
            for fk in fks
        }
        column_entries: list[dict[str, Any]] = []
        for column in columns:
            full_name = f"{schema_name}.{table_name}"
            sample_values = await _sample_values_async(conn, full_name, column["column_name"], sample_limit)
            fk_ref = fk_map.get((table_name, column["column_name"]))
            column_entries.append(
                {
                    "name": column["column_name"],
                    "type": column["data_type"],
                    "nullable": column["is_nullable"] == "YES",
                    "foreign_key": fk_ref is not None,
                    "references": fk_ref,
                    "sample_values": sample_values,
                }
            )
        results.append(
            {
                "name": f"{schema_name}.{table_name}",
                "description": None,
                "columns": column_entries,
                "relationships": list({fk for fk in fk_map.values()}),
            }
        )
    return results


async def extract_mysql_schema(cursor: Any, sample_limit: int) -> list[dict[str, Any]]:
    """Extract schema metadata from MySQL."""

    await cursor.execute(
        """
        select table_schema, table_name
        from information_schema.tables
        where table_type = 'BASE TABLE' and table_schema = database()
        order by table_name
        """
    )
    tables = await cursor.fetchall()
    results: list[dict[str, Any]] = []
    for table in tables:
        table_schema = table["table_schema"]
        table_name = table["table_name"]
        await cursor.execute(
            """
            select column_name, data_type, is_nullable
            from information_schema.columns
            where table_schema = %s and table_name = %s
            order by ordinal_position
            """,
            (table_schema, table_name),
        )
        columns = await cursor.fetchall()
        await cursor.execute(
            """
            select column_name, referenced_table_name, referenced_column_name
            from information_schema.key_column_usage
            where table_schema = %s and table_name = %s and referenced_table_name is not null
            """,
            (table_schema, table_name),
        )
        fks = await cursor.fetchall()
        fk_map = {
            (fk["column_name"]): f"{fk['referenced_table_name']}.{fk['referenced_column_name']}"
            for fk in fks
        }
        column_entries: list[dict[str, Any]] = []
        for column in columns:
            full_name = f"{table_name}"
            sample_values = await _sample_values_async(cursor, full_name, column["column_name"], sample_limit)
            fk_ref = fk_map.get(column["column_name"])
            column_entries.append(
                {
                    "name": column["column_name"],
                    "type": column["data_type"],
                    "nullable": column["is_nullable"] == "YES",
                    "foreign_key": fk_ref is not None,
                    "references": fk_ref,
                    "sample_values": sample_values,
                }
            )
        results.append(
            {
                "name": table_name,
                "description": None,
                "columns": column_entries,
                "relationships": list({fk for fk in fk_map.values()}),
            }
        )
    return results


async def extract_sqlite_schema(conn: Any, sample_limit: int) -> list[dict[str, Any]]:
    """Extract schema metadata from SQLite."""

    tables = await conn.execute_fetchall(
        "select name from sqlite_master where type='table' and name not like 'sqlite_%'"
    )
    results: list[dict[str, Any]] = []
    for (table_name,) in tables:
        columns = await conn.execute_fetchall(f"pragma table_info('{table_name}')")
        fk_rows = await conn.execute_fetchall(f"pragma foreign_key_list('{table_name}')")
        fk_map = {
            fk_row[3]: f"{fk_row[2]}.{fk_row[4]}" for fk_row in fk_rows
        }
        column_entries: list[dict[str, Any]] = []
        for column in columns:
            column_name = column[1]
            sample_values = await _sample_values_async(conn, table_name, column_name, sample_limit)
            fk_ref = fk_map.get(column_name)
            column_entries.append(
                {
                    "name": column_name,
                    "type": column[2],
                    "nullable": column[3] == 0,
                    "foreign_key": fk_ref is not None,
                    "references": fk_ref,
                    "sample_values": sample_values,
                }
            )
        results.append(
            {
                "name": table_name,
                "description": None,
                "columns": column_entries,
                "relationships": list({fk for fk in fk_map.values()}),
            }
        )
    return results


async def extract_duckdb_schema(conn: Any, sample_limit: int) -> list[dict[str, Any]]:
    """Extract schema metadata from DuckDB."""

    tables = conn.execute(
        "select table_name from information_schema.tables where table_schema = 'main'"
    ).fetchall()
    results: list[dict[str, Any]] = []
    for (table_name,) in tables:
        columns = conn.execute(
            """
            select column_name, data_type, is_nullable
            from information_schema.columns
            where table_schema = 'main' and table_name = ?
            order by ordinal_position
            """,
            (table_name,),
        ).fetchall()
        column_entries: list[dict[str, Any]] = []
        for column in columns:
            column_name = column[0]
            sample_values = await _sample_values_async(conn, table_name, column_name, sample_limit)
            column_entries.append(
                {
                    "name": column_name,
                    "type": column[1],
                    "nullable": column[2] == "YES",
                    "foreign_key": False,
                    "references": None,
                    "sample_values": sample_values,
                }
            )
        results.append(
            {
                "name": table_name,
                "description": None,
                "columns": column_entries,
                "relationships": [],
            }
        )
    return results


async def _sample_values_async(conn: Any, table_name: str, column_name: str, limit: int) -> list[str]:
    """Fetch sample values for a column using a best-effort query."""

    query = f"select distinct {column_name} from {table_name} where {column_name} is not null limit {limit}"
    try:
        if hasattr(conn, "fetch"):
            records = await conn.fetch(query)
            return [str(record[0]) for record in records if record[0] is not None]
        if hasattr(conn, "execute_fetchall"):
            rows = await conn.execute_fetchall(query)
            return [str(row[0]) for row in rows if row[0] is not None]
        if hasattr(conn, "execute") and hasattr(conn, "fetchall"):
            await conn.execute(query)
            rows = await conn.fetchall()
            return [str(row[0]) for row in rows if row[0] is not None]
        if hasattr(conn, "execute"):
            rows = conn.execute(query).fetchall()
            return [str(row[0]) for row in rows if row[0] is not None]
    except Exception:
        return []
    return []
