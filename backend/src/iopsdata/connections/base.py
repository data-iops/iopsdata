"""Base interfaces for database connections."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class QueryResult:
    """Normalized query result from any database."""

    columns: list[str]
    rows: list[tuple[Any, ...]]
    row_count: int


class DatabaseConnection(ABC):
    """Abstract database connection wrapper."""

    def __init__(
        self,
        name: str,
        read_only: bool = True,
        query_timeout_s: int = 30,
        max_rows: int = 500,
    ) -> None:
        self.name = name
        self.read_only = read_only
        self.query_timeout_s = query_timeout_s
        self.max_rows = max_rows

    @abstractmethod
    async def connect(self) -> None:
        """Establish the connection or connection pool."""

    @abstractmethod
    async def disconnect(self) -> None:
        """Close the connection or connection pool."""

    @abstractmethod
    async def execute(self, query: str, *args: Any) -> QueryResult:
        """Execute a query and return normalized results."""

    @abstractmethod
    async def get_schema(self) -> list[dict[str, Any]]:
        """Extract schema metadata for the database."""

    @abstractmethod
    def is_connected(self) -> bool:
        """Return whether the connection is healthy."""

    @abstractmethod
    def pool_status(self) -> dict[str, Any]:
        """Return stats about the underlying connection pool."""
