# iOpsData

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)

**AI-native data workspace** - Query, analyze, and visualize your data with natural language.

## Features

- Natural language to SQL query generation
- Multi-database connectivity (PostgreSQL, DuckDB, and more)
- Interactive data exploration and visualization
- AI-powered data insights and analysis

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/data-iops/iopsdata.git
cd iopsdata
```

2. Run the setup script:

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

3. Configure environment variables:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

4. Start the development servers:

**Backend:**
```bash
cd backend
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uvicorn src.iopsdata.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

5. Open your browser:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## Project Structure

```
iopsdata/
├── backend/           # Python FastAPI backend
│   ├── src/
│   │   └── iopsdata/  # Main application package
│   └── pyproject.toml
├── frontend/          # Next.js 14 frontend
│   └── src/
├── docs/              # Documentation
├── scripts/           # Setup and utility scripts
├── .env.example       # Environment variables template
└── README.md
```

## Development

See the [docs](./docs/README.md) for detailed development guidelines.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
