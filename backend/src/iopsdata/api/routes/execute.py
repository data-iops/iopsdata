"""SQL execution route."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from iopsdata.api.dependencies import get_connection_manager
from iopsdata.api.schemas import ExecuteRequest, ExecuteResponse, QueryResultPayload
from iopsdata.connections.manager import ConnectionManager

router = APIRouter(tags=["execute"])


@router.post("/execute", response_model=ExecuteResponse)
async def execute_sql(
    request: ExecuteRequest,
    manager: ConnectionManager = Depends(get_connection_manager),
) -> ExecuteResponse:
    """Execute SQL against a stored connection."""

    connection = manager.get(request.connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")

    result = await connection.execute(request.sql)
    return ExecuteResponse(
        results=QueryResultPayload(
            columns=result.columns,
            rows=[list(row) for row in result.rows],
            row_count=result.row_count,
        )
    )
