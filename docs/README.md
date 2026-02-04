# iOpsData Documentation

Welcome to the comprehensive documentation for **iOpsData**, an AI-native operating system for data work. This documentation is designed for contributors, self-hosters, and community members who want to understand, deploy, and extend the project.

## Project Overview

iOpsData is building the **Cursor for Data Professionals**—a single workspace where data analysts, analytics engineers, data scientists, and ML engineers can explore, build, and ship data work end-to-end without tool fragmentation.

**Mission:** Collapse the modern data stack into one intelligent, open, and extensible workspace.

### Core Principles
- **AI-first, not AI-added**
- **Open by default**
- **Context > code**
- **Human-in-the-loop always**
- **Composable, not monolithic**

## Architecture Diagram (ASCII)

```
+---------------------------+          +-------------------------------+
|        Frontend UI        |  HTTPS   |          Backend API           |
|  Next.js / React / Tailwind| <------> |  FastAPI / Python / LLM Router |
+-------------+-------------+          +---------+---------------------+
              |                                 |
              |                                 |
              v                                 v
+---------------------------+          +-------------------------------+
|    Supabase / Postgres    |          |  External Data Warehouses     |
|  Auth, storage, metadata  |          |  Snowflake, BigQuery, etc.    |
+---------------------------+          +-------------------------------+
              |
              v
+---------------------------+
|    LLM Providers (OpenAI, |
|    Anthropic, Groq, etc.) |
+---------------------------+
```

## Technology Stack

**Frontend**
- Next.js 16
- React 19
- Tailwind CSS
- Zustand for state management
- Supabase client libraries

**Backend**
- FastAPI
- Pydantic + pydantic-settings
- Supabase (auth + storage)
- DuckDB for local file profiling
- Async database connectors

**AI / LLM Layer**
- Provider router with pluggable LLMs
- Prompt orchestration for SQL generation
- Token accounting + structured responses

## Repository Structure

```
/iopsdata
├── backend/              # FastAPI service
│   ├── src/iopsdata/      # Core backend package
│   └── tests/             # Backend tests
├── frontend/             # Next.js UI
│   ├── src/               # Components, pages, state
│   └── public/            # Static assets
├── docs/                 # Comprehensive documentation
├── scripts/              # Local helper scripts
├── .github/              # CI, issue templates, etc.
└── .env.example           # Root-level environment sample
```

## Where to Go Next
- **Installation:** [`INSTALLATION.md`](./INSTALLATION.md)
- **Configuration:** [`CONFIGURATION.md`](./CONFIGURATION.md)
- **Deployment:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **API Reference:** [`API.md`](./API.md)
- **Contributing:** [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- **Roadmap:** [`ROADMAP.md`](./ROADMAP.md)
- **FAQ:** [`FAQ.md`](./FAQ.md)

If you’re new, start with **INSTALLATION** and then explore **ARCHITECTURE** for a deeper understanding.
