# FAQ

## What is iOpsData?

iOpsData is an AI-native operating system for data work—think Cursor for Data Professionals. It brings SQL, profiling, lineage, and AI into one workspace.

## How is it different from X?

Unlike traditional BI tools or notebooks, iOpsData is **context-first**: it understands schemas, lineage, and metrics, so AI outputs are grounded in your data model.

## Is it really free?

The core project is open source (Apache 2.0). Paid hosted offerings may be introduced for convenience, enterprise auth, and support.

## What databases are supported?

Currently:
- Postgres-compatible databases
- DuckDB (local file profiling)

Planned:
- Snowflake
- BigQuery
- Redshift

## What LLMs can I use?

Any provider supported by the LLM router. Current integrations include OpenAI and Anthropic, with more planned.

## Is my data secure?

- Connection configs are encrypted using `FERNET_KEY`.
- Supabase handles auth and RLS policies.
- You control your deployment and secrets.

## Can I self-host?

Yes. The project is designed for local and self-hosted deployments with Railway/Render/Vercel support.

## How do I contribute?

Start with [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, code style, and pull request guidelines.

## Where do I get help?

Open a GitHub issue or reach out via the community channels in the main README.
