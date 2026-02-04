"""FastAPI application setup for iOpsData."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from iopsdata.api.dependencies import ConnectionManagerProvider
from iopsdata.api.routes.auth import router as auth_router
from iopsdata.api.routes.chat import router as chat_router
from iopsdata.api.routes.connections import router as connections_router
from iopsdata.api.routes.execute import router as execute_router
from iopsdata.api.routes.files import router as files_router
from iopsdata.api.routes.lineage import router as lineage_router
from iopsdata.api.routes.providers import router as providers_router
from iopsdata.api.routes.settings import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup application state."""

    fernet_key = os.getenv("FERNET_KEY")
    if not fernet_key:
        raise RuntimeError("FERNET_KEY must be set for connection management")
    app.state.connection_manager = ConnectionManagerProvider(fernet_key).manager
    yield
    # Cleanup connections on shutdown.
    manager = app.state.connection_manager
    for name in list(manager._connections.keys()):
        await manager.disconnect(name)


app = FastAPI(title="iOpsData API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.exception_handler(RuntimeError)
async def runtime_error_handler(_: Request, exc: RuntimeError) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""

    return {"status": "ok"}


app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(execute_router, prefix="/api")
app.include_router(connections_router, prefix="/api")
app.include_router(files_router, prefix="/api")
app.include_router(lineage_router, prefix="/api")
app.include_router(providers_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
