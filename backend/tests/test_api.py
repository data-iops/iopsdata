"""Tests for FastAPI endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient

from iopsdata.api.main import app


def test_health_check() -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_providers_endpoint() -> None:
    client = TestClient(app)
    response = client.get("/api/providers")
    assert response.status_code == 200
    assert "providers" in response.json()


def test_lineage_endpoint() -> None:
    client = TestClient(app)
    response = client.post("/api/lineage", json={"sql": "select * from users"})
    assert response.status_code == 200
    assert response.json()["query_type"] == "SELECT"
