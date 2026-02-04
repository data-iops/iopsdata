"""Load files into DuckDB for querying."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import duckdb


def _detect_delimiter(path: Path) -> str:
    sample = path.read_text(encoding="utf-8", errors="ignore").splitlines()[:5]
    if not sample:
        return ","
    candidates = {",": 0, "\t": 0, ";": 0, "|": 0}
    for line in sample:
        for delimiter in candidates:
            candidates[delimiter] += line.count(delimiter)
    return max(candidates, key=candidates.get)


def load_file_to_duckdb(
    file_path: str | Path,
    connection: duckdb.DuckDBPyConnection | None = None,
    table_name: str = "uploaded_file",
    chunk_size: int = 50_000,
) -> duckdb.DuckDBPyConnection:
    """Load a file into DuckDB as a table.

    Returns the DuckDB connection with the table registered.
    """

    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    conn = connection or duckdb.connect(":memory:")
    suffix = path.suffix.lower()

    if suffix == ".csv":
        delimiter = _detect_delimiter(path)
        conn.execute(
            f"""
            create or replace table {table_name} as
            select * from read_csv_auto('{path.as_posix()}', delim='{delimiter}')
            """
        )
    elif suffix in {".xlsx", ".xls"}:
        conn.execute("install 'excel'; load 'excel';")
        conn.execute(
            f"""
            create or replace table {table_name} as
            select * from read_excel('{path.as_posix()}')
            """
        )
    elif suffix == ".parquet":
        conn.execute(
            f"""
            create or replace table {table_name} as
            select * from read_parquet('{path.as_posix()}')
            """
        )
    elif suffix == ".json":
        conn.execute(
            f"""
            create or replace table {table_name} as
            select * from read_json_auto('{path.as_posix()}')
            """
        )
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    if chunk_size:
        conn.execute(
            f"create or replace table {table_name} as select * from {table_name} limit {chunk_size}"
        )

    return conn


def get_table_preview(conn: duckdb.DuckDBPyConnection, table_name: str, limit: int = 10) -> list[dict[str, Any]]:
    """Return a preview of rows from a DuckDB table."""

    result = conn.execute(f"select * from {table_name} limit {limit}").fetchdf()
    return result.to_dict(orient="records")
