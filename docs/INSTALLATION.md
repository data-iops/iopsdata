# Installation Guide

This guide walks you through setting up iOpsData locally for development.

## Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **npm** or **pnpm**
- **Supabase** project (for auth + storage)
- **LLM API keys** (OpenAI, Anthropic, etc.)

## 1) Clone the Repository

```bash
git clone https://github.com/data-iops/iopsdata.git
cd iopsdata
```

## 2) One-Command Setup (Recommended)

### macOS/Linux

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Windows (PowerShell)

```powershell
.\scripts\setup.ps1
```

This creates a Python virtual environment, installs backend dependencies, and installs frontend packages.

## 3) Backend Setup (Manual)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
```

Then start the API:

```bash
uvicorn src.iopsdata.api.main:app --reload --port 8000
```

## 4) Frontend Setup (Manual)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The UI will be available at:

```
http://localhost:3000
```

## 5) Set Up Supabase

1. Create a new Supabase project.
2. Copy your **Project URL** and **anon key**.
3. Add the values to `.env` and `.env.local`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6) Add LLM API Keys

Add one or more provider keys in `.env`:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
```

## 7) Verify Installation

### Backend

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "ok"}
```

### Frontend

Open the UI and ensure it loads with no errors:

```
http://localhost:3000
```

## Common Issues & Fixes

### Missing `FERNET_KEY`
If you see `FERNET_KEY must be set`, generate a key:

```bash
python - <<'PY'
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
PY
```

Then add it to `.env`:

```bash
FERNET_KEY=your-generated-key
```

### CORS Errors
Set `CORS_ORIGINS` in `.env`:

```bash
CORS_ORIGINS=http://localhost:3000
```

### Missing Node Modules
Reinstall dependencies:

```bash
cd frontend
npm install
```

If issues persist, open a GitHub issue with logs and environment details.
