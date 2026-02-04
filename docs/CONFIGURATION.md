# Configuration

This document describes all environment variables and configuration options for iOpsData.

## Backend Environment Variables

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `APP_ENV` | No | `dev` or `prod` | `dev` |
| `APP_NAME` | No | Application name | `iOpsData` |
| `DEBUG` | No | Enable debug mode | `false` |
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key | `eyJ...` |
| `SUPABASE_MAX_CONNECTIONS` | No | Supabase pool size | `50` |
| `SUPABASE_MAX_KEEPALIVE` | No | Supabase keep-alive pool | `10` |
| `SUPABASE_TIMEOUT` | No | Supabase timeout (seconds) | `30` |
| `FERNET_KEY` | Yes | Encryption key for connections | `Z0FBQU...` |
| `CORS_ORIGINS` | No | Allowed origins | `http://localhost:3000` |
| `OPENAI_API_KEY` | Optional | OpenAI API key | `sk-...` |
| `OPENAI_BASE_URL` | Optional | OpenAI base URL override | `https://api.openai.com/v1` |
| `ANTHROPIC_API_KEY` | Optional | Anthropic API key | `...` |
| `ANTHROPIC_BASE_URL` | Optional | Anthropic base URL override | `https://api.anthropic.com/v1` |

## Frontend Environment Variables

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for backend API | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key | `eyJ...` |
| `NEXT_PUBLIC_APP_ENV` | No | Frontend app environment | `dev` |

## LLM Provider Configuration

1. Add one or more API keys in the backend `.env`:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
```

2. Restart the backend.
3. The `/api/providers` endpoint returns configured providers.

## Database Connection Options

iOpsData supports multiple backends through the connection manager:

- Postgres-compatible databases
- DuckDB for local file profiling
- (Planned) Snowflake, BigQuery, Redshift

Connections are created via the `/api/connections` endpoint and stored securely using `FERNET_KEY` encryption.

## Security Settings

- **FERNET_KEY** is required and encrypts stored connection metadata.
- **CORS_ORIGINS** should be restricted in production.
- Use HTTPS in production and configure secure headers at the edge (Vercel, Cloudflare, etc.).

## Performance Tuning

- Tune Supabase connection limits via `SUPABASE_MAX_CONNECTIONS` and `SUPABASE_MAX_KEEPALIVE`.
- Enable caching for common query patterns.
- Use background jobs for heavy profiling and lineage extraction (planned).
