"""Tests for file profiling utilities."""

from __future__ import annotations

from iopsdata.files.profiler import profile_file


def test_profile_file_basic(sample_csv) -> None:
    profile = profile_file(sample_csv)
    assert profile.row_count == 3
    assert profile.column_count == 2


def test_profile_file_columns(sample_csv) -> None:
    profile = profile_file(sample_csv)
    column_names = {column.name for column in profile.columns}
    assert {"id", "value"}.issubset(column_names)


def test_profile_quality_score_range(sample_csv) -> None:
    profile = profile_file(sample_csv)
    assert 0.0 <= profile.quality_score <= 1.0
