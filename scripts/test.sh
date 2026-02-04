#!/usr/bin/env bash

# =============================================================================
# iOpsData Test Runner (Linux/macOS)
# =============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

run_backend_tests() {
  echo "Running backend tests..."
  cd "$BACKEND_DIR"
  if [ -d ".venv" ]; then
    source .venv/bin/activate
  fi
  python -m pytest
  python -m ruff check .
  if [ -n "${VIRTUAL_ENV:-}" ]; then
    deactivate
  fi
}

run_frontend_tests() {
  echo "Running frontend checks..."
  cd "$FRONTEND_DIR"
  if [ -f "package.json" ]; then
    npm run lint
    if npm run | grep -q " test"; then
      npm run test -- --watch=false
    else
      echo "No frontend test script detected; skipping Jest."
    fi
  fi
}

run_backend_tests
run_frontend_tests
