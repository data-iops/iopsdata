"""Tests for SQL lineage parsing."""

from __future__ import annotations

from iopsdata.lineage.parser import extract_lineage


def test_extract_lineage_select() -> None:
    lineage = extract_lineage("select id, name from users")
    assert lineage.query_type == "SELECT"
    assert "users" in lineage.tables_read


def test_extract_lineage_cte() -> None:
    sql = "with recent as (select * from orders) select * from recent"
    lineage = extract_lineage(sql)
    assert "recent" in lineage.ctes


def test_extract_lineage_insert() -> None:
    sql = "insert into archive select * from events"
    lineage = extract_lineage(sql)
    assert "archive" in lineage.tables_written
    assert "events" in lineage.tables_read
