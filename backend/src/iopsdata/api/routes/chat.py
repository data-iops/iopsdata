"""Chat route for NL-to-SQL generation."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from iopsdata.api.dependencies import get_connection_manager
from iopsdata.api.schemas import ChatRequest, ChatResponse, QueryResultPayload
from iopsdata.connections.manager import ConnectionManager
from iopsdata.llm.context import SQL_GENERATION_PROMPT, build_schema_context, extract_sql_from_response, table_from_dict
from iopsdata.llm.router import get_provider

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, manager: ConnectionManager = Depends(get_connection_manager)) -> ChatResponse:
    """Generate SQL from natural language and optionally execute it."""

    connection = manager.get(request.connection_id)
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")

    schema = await manager.schema_for(request.connection_id)
    tables = [table_from_dict(table) for table in schema]
    schema_context = build_schema_context(tables, dialect=request.dialect or "postgresql")

    prompt = SQL_GENERATION_PROMPT.format(schema_context=schema_context, user_request=request.prompt)

    provider = get_provider(request.provider or "groq")
    if not provider.is_configured():
        raise HTTPException(status_code=400, detail=f"Provider {provider.name} is not configured")

    try:
        response = await provider.generate(prompt)
    finally:
        await provider.close()

    sql = extract_sql_from_response(response.content) or response.content.strip()

    results = None
    if request.auto_execute:
        query_result = await connection.execute(sql)
        results = QueryResultPayload(
            columns=query_result.columns,
            rows=[list(row) for row in query_result.rows],
            row_count=query_result.row_count,
        )

    return ChatResponse(
        sql=sql,
        provider=response.provider,
        model=response.model,
        tokens={
            "prompt": response.prompt_tokens,
            "completion": response.completion_tokens,
            "total": response.total_tokens,
        },
        results=results,
    )
