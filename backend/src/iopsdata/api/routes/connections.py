"""Connection management routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from iopsdata.api.dependencies import get_connection_manager
from iopsdata.api.schemas import ConnectionCreate, ConnectionResponse
from iopsdata.connections.manager import ConnectionManager

router = APIRouter(tags=["connections"])


@router.post("/connections", response_model=ConnectionResponse)
async def create_connection(
    payload: ConnectionCreate,
    manager: ConnectionManager = Depends(get_connection_manager),
) -> ConnectionResponse:
    """Create and register a new connection."""

    connection = manager.create_connection(payload.provider, payload.name, **payload.config)
    await connection.connect()
    manager.register(payload.name, connection)
    return ConnectionResponse(name=payload.name, provider=payload.provider, status=connection.pool_status())


@router.get("/connections/{connection_id}", response_model=ConnectionResponse)
async def get_connection(
    connection_id: str,
    manager: ConnectionManager = Depends(get_connection_manager),
) -> ConnectionResponse:
    """Fetch an existing connection status."""

    connection = manager.get(connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    return ConnectionResponse(name=connection_id, provider=connection.__class__.__name__, status=connection.pool_status())


@router.delete("/connections/{connection_id}")
async def delete_connection(
    connection_id: str,
    manager: ConnectionManager = Depends(get_connection_manager),
) -> dict[str, str]:
    """Remove an existing connection."""

    await manager.disconnect(connection_id)
    return {"status": "disconnected"}
