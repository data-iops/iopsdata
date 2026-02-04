#!/usr/bin/env bash

# =============================================================================
# iOpsData Development Setup Script (Linux/macOS)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  iOpsData Development Setup${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""

# Check Python version
echo -e "${YELLOW}Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f1)
    PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d'.' -f2)

    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 11 ]; then
        echo -e "${GREEN}Python $PYTHON_VERSION found${NC}"
    else
        echo -e "${RED}Error: Python 3.11+ required, found $PYTHON_VERSION${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi

# Check Node.js version
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)

    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}Node.js v$NODE_VERSION found${NC}"
    else
        echo -e "${RED}Error: Node.js 18+ required, found v$NODE_VERSION${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm not found. Please install npm${NC}"
    exit 1
fi

echo ""

# Setup Backend
echo -e "${YELLOW}Setting up backend...${NC}"
cd "$PROJECT_ROOT/backend"

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[dev]"

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}Created backend/.env from .env.example${NC}"
    fi
fi

deactivate

echo -e "${GREEN}Backend setup complete!${NC}"
echo ""

# Setup Frontend
echo -e "${YELLOW}Setting up frontend...${NC}"
cd "$PROJECT_ROOT/frontend"

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}Created frontend/.env.local from .env.example${NC}"
    fi
fi

echo -e "${GREEN}Frontend setup complete!${NC}"
echo ""

# Setup root environment
cd "$PROJECT_ROOT"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}Created .env from .env.example${NC}"
    fi
fi

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "To start the development servers:"
echo ""
echo -e "${YELLOW}Backend:${NC}"
echo "  cd backend"
echo "  source .venv/bin/activate"
echo "  uvicorn src.iopsdata.main:app --reload --port 8000"
echo ""
echo -e "${YELLOW}Frontend:${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open:"
echo "  - Frontend: http://localhost:3000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
