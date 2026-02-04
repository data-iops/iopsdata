"""File profiling utilities powered by DuckDB."""

from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

import duckdb

from iopsdata.files.loader import load_file_to_duckdb
from iopsdata.files.models import ColumnProfile, FileProfile

PII_HINTS = {
    "email",
    "phone",
    "ssn",
    "social",
    "credit",
    "card",
    "passport",
    "address",
    "dob",
    "birth",
    "ip",
}


def _is_pii_column(name: str) -> bool:
    lowered = name.lower()
    return any(hint in lowered for hint in PII_HINTS)


def _column_profile(conn: duckdb.DuckDBPyConnection, table_name: str, column: str, row_count: int) -> ColumnProfile:
    stats = conn.execute(
        f"""
        select
            count(*) as total_count,
            count({column}) as non_null_count,
            count(distinct {column}) as distinct_count
        from {table_name}
        """
    ).fetchone()
    null_count = int(stats[0] - stats[1])
    distinct_count = int(stats[2])

    sample_values = conn.execute(
        f"select {column} from {table_name} where {column} is not null limit 5"
    ).fetchall()
    samples = [row[0] for row in sample_values if row[0] is not None]

    data_type = conn.execute(
        f"select typeof({column}) from {table_name} where {column} is not null limit 1"
    ).fetchone()
    data_type_str = data_type[0] if data_type else "unknown"

    min_value = None
    max_value = None
    mean_value = None
    percentiles: dict[str, float] | None = None
    most_common: list[Any] | None = None

    if data_type_str in {"INTEGER", "BIGINT", "DOUBLE", "DECIMAL", "REAL"}:
        numeric_stats = conn.execute(
            f"""
            select
                min({column}) as min_value,
                max({column}) as max_value,
                avg({column}) as mean_value,
                approx_quantile({column}, 0.5) as p50,
                approx_quantile({column}, 0.9) as p90,
                approx_quantile({column}, 0.99) as p99
            from {table_name}
            """
        ).fetchone()
        min_value, max_value, mean_value = numeric_stats[:3]
        percentiles = {
            "p50": float(numeric_stats[3]) if numeric_stats[3] is not None else 0.0,
            "p90": float(numeric_stats[4]) if numeric_stats[4] is not None else 0.0,
            "p99": float(numeric_stats[5]) if numeric_stats[5] is not None else 0.0,
        }
    elif "DATE" in data_type_str or "TIMESTAMP" in data_type_str:
        date_stats = conn.execute(
            f"""
            select min({column}) as min_value, max({column}) as max_value
            from {table_name}
            """
        ).fetchone()
        min_value, max_value = date_stats
        common_values = conn.execute(
            f"""
            select {column}, count(*) as cnt
            from {table_name}
            where {column} is not null
            group by {column}
            order by cnt desc
            limit 3
            """
        ).fetchall()
        most_common = [row[0] for row in common_values]
    else:
        common_values = conn.execute(
            f"""
            select {column}, count(*) as cnt
            from {table_name}
            where {column} is not null
            group by {column}
            order by cnt desc
            limit 3
            """
        ).fetchall()
        most_common = [row[0] for row in common_values]

    return ColumnProfile(
        name=column,
        data_type=data_type_str,
        null_count=null_count,
        distinct_count=distinct_count,
        sample_values=samples,
        min_value=min_value,
        max_value=max_value,
        mean_value=float(mean_value) if mean_value is not None else None,
        percentiles=percentiles,
        most_common=most_common,
        pii_flag=_is_pii_column(column),
    )


def profile_file(file_path: str | Path) -> FileProfile:
    """Profile a file using DuckDB to compute column statistics."""

    conn = load_file_to_duckdb(file_path)
    table_name = "uploaded_file"

    row_count = conn.execute(f"select count(*) from {table_name}").fetchone()[0]
    columns = [col[1] for col in conn.execute(f"pragma table_info('{table_name}')").fetchall()]

    column_profiles = [_column_profile(conn, table_name, column, row_count) for column in columns]
    null_ratios = [profile.null_count / row_count if row_count else 0 for profile in column_profiles]
    completeness_score = 1.0 - (sum(null_ratios) / len(null_ratios)) if null_ratios else 1.0

    quality_score = max(0.0, min(1.0, completeness_score))

    return FileProfile(
        row_count=row_count,
        column_count=len(columns),
        columns=column_profiles,
        quality_score=quality_score,
    )
