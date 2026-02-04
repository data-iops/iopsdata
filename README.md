<p align="center">
  <img src="https://placehold.co/1200x300?text=iOpsData" alt="iOpsData banner" />
</p>

# iOpsData

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Build](https://github.com/data-iops/iopsdata/actions/workflows/ci.yml/badge.svg)](https://github.com/data-iops/iopsdata/actions/workflows/ci.yml)
[![Version](https://img.shields.io/github/v/release/data-iops/iopsdata?include_prereleases)](https://github.com/data-iops/iopsdata/releases)
[![Discord](https://img.shields.io/badge/Discord-Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/your-invite)

**iOpsData is the Cursor for Data Professionals** — an AI-native operating system where analysts and engineers can explore, model, and ship data work end-to-end without tool fragmentation.

## Key Features

- 🧠 **Conversational data workbench** (NL → SQL, multi-turn chat)
- 🧭 **Lineage & impact analysis** for tables and columns
- 📊 **Dynamic canvas** for charts, tables, and notebooks
- 🧬 **Semantic layer ready** (metrics as first-class objects)
- 🔒 **Open & auditable** with secure encryption for connections

## Quick Demo

![iOpsData demo](https://placehold.co/1200x600?text=iOpsData+Demo)

## Quick Start (5 Steps)

1. **Clone**
   ```bash
   git clone https://github.com/data-iops/iopsdata.git
   cd iopsdata
   ```
2. **Run setup**
   ```bash
   ./scripts/setup.sh
   ```
3. **Configure env**
   ```bash
   cp .env.example .env
   ```
4. **Start backend**
   ```bash
   cd backend
   source .venv/bin/activate
   uvicorn src.iopsdata.api.main:app --reload --port 8000
   ```
5. **Start frontend**
   ```bash
   cd frontend
   npm run dev
   ```

Open the app at `http://localhost:3000`.

## Documentation

- 📘 [Docs Home](./docs/README.md)
- 🛠️ [Installation](./docs/INSTALLATION.md)
- ⚙️ [Configuration](./docs/CONFIGURATION.md)
- 🚀 [Deployment](./docs/DEPLOYMENT.md)
- 🧱 [Architecture](./docs/ARCHITECTURE.md)
- 📡 [API](./docs/API.md)
- 🤝 [Contributing](./docs/CONTRIBUTING.md)

## Tech Stack

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.x-3ecf8e?logo=supabase&logoColor=white)

## Contributing

We welcome community contributions! Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide.

## Community

- Discord: https://discord.gg/your-invite
- Issues: https://github.com/data-iops/iopsdata/issues

## License

Apache 2.0. See [LICENSE](LICENSE).

## Acknowledgments

Inspired by Cursor and the open-source data community.
