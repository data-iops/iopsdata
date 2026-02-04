#!/usr/bin/env bash

# =============================================================================
# iOpsData Development Runner (Linux/macOS)
# =============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run both services in one terminal."
  echo "Start manually in separate terminals:"
  echo "  cd backend && source .venv/bin/activate && uvicorn src.iopsdata.api.main:app --reload --port 8000"
  echo "  cd frontend && npm run dev"
  exit 1
fi

cd "$PROJECT_ROOT"

npx concurrently -k -n backend,frontend -c blue,green \
  "cd $BACKEND_DIR && source .venv/bin/activate && uvicorn src.iopsdata.api.main:app --reload --port 8000" \
  "cd $FRONTEND_DIR && npm run dev"
