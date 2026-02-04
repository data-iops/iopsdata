"""Tests for database connections."""

from __future__ import annotations

import sqlite3

import pytest

from iopsdata.connections.providers.sqlite import SQLiteConnection


@pytest.mark.asyncio
async def test_sqlite_connection_execute(tmp_path) -> None:
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(db_path)
    conn.execute("create table items (id integer, name text)")
    conn.execute("insert into items values (1, 'apple')")
    conn.commit()
    conn.close()

    connection = SQLiteConnection(name="test", path=str(db_path), read_only=True)
    await connection.connect()
    result = await connection.execute("select * from items")
    await connection.disconnect()

    assert result.row_count == 1
    assert result.columns == ["id", "name"]


@pytest.mark.asyncio
async def test_sqlite_connection_read_only_blocks(tmp_path) -> None:
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(db_path)
    conn.execute("create table items (id integer)")
    conn.commit()
    conn.close()

    connection = SQLiteConnection(name="test", path=str(db_path), read_only=True)
    await connection.connect()
    with pytest.raises(PermissionError):
        await connection.execute("insert into items values (1)")
    await connection.disconnect()


@pytest.mark.asyncio
async def test_sqlite_schema_extraction(tmp_path) -> None:
    db_path = tmp_path / "test.db"
    conn = sqlite3.connect(db_path)
    conn.execute("create table items (id integer, name text)")
    conn.commit()
    conn.close()

    connection = SQLiteConnection(name="test", path=str(db_path), read_only=True)
    await connection.connect()
    schema = await connection.get_schema()
    await connection.disconnect()

    assert schema
    assert schema[0]["name"] == "items"
