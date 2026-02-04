"""Lineage graph builder for query dependencies."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from uuid import uuid4

from iopsdata.lineage.parser import LineageExtraction


@dataclass
class LineageNode:
    """Graph node representing a table, query, or output."""

    id: str
    node_type: str
    label: str
    metadata: dict[str, str] = field(default_factory=dict)


@dataclass
class LineageEdge:
    """Graph edge representing data flow between nodes."""

    source: str
    target: str
    relation: str


class LineageGraph:
    """Graph structure capturing SQL lineage and dependencies."""

    def __init__(self) -> None:
        self.nodes: dict[str, LineageNode] = {}
        self.edges: list[LineageEdge] = []

    def _ensure_node(self, node_type: str, label: str, metadata: dict[str, str] | None = None) -> LineageNode:
        node_id = f"{node_type}:{label}"
        if node_id not in self.nodes:
            self.nodes[node_id] = LineageNode(
                id=node_id,
                node_type=node_type,
                label=label,
                metadata=metadata or {},
            )
        return self.nodes[node_id]

    def add_query(self, lineage: LineageExtraction) -> str:
        """Add a query to the graph and return the query node id."""

        query_id = f"query:{uuid4().hex}"
        self.nodes[query_id] = LineageNode(
            id=query_id,
            node_type="query",
            label=lineage.query_type,
            metadata={"sql": lineage.sql},
        )

        for table in lineage.tables_read:
            table_node = self._ensure_node("table", table)
            self.edges.append(LineageEdge(source=table_node.id, target=query_id, relation="reads"))

        for table in lineage.tables_written:
            table_node = self._ensure_node("table", table)
            self.edges.append(LineageEdge(source=query_id, target=table_node.id, relation="writes"))

        for cte in lineage.ctes:
            cte_node = self._ensure_node("cte", cte)
            self.edges.append(LineageEdge(source=cte_node.id, target=query_id, relation="cte"))

        return query_id

    def to_dict(self) -> dict[str, list[dict[str, str]]]:
        """Export graph data for visualization."""

        return {
            "nodes": [node.__dict__ for node in self.nodes.values()],
            "edges": [edge.__dict__ for edge in self.edges],
        }

    def to_json(self) -> str:
        """Export graph data as JSON."""

        return json.dumps(self.to_dict(), indent=2)
