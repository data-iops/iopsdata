# Architecture

This document explains how iOpsData is structured across the frontend, backend, data layer, and AI layer.

## System Overview

iOpsData is an AI-native operating system for data work. It combines a conversational workspace with structured data context, safe execution, and lineage tracking.

**High-level flow:**
1. User asks a question in the UI.
2. Backend builds schema context and calls an LLM provider.
3. SQL is generated and optionally executed.
4. Results, lineage, and metadata are returned to the UI.

## Backend Architecture

**Core components:**
- **FastAPI app** (`src/iopsdata/api/main.py`) with modular route files.
- **Connection manager** to register and manage database connections.
- **LLM router** to select providers (OpenAI, Anthropic, Groq, etc.).
- **Lineage parser** to extract tables, columns, and CTEs from SQL.

**Primary routes:**
- `/api/chat` → NL-to-SQL generation + optional execution
- `/api/execute` → Execute SQL on a stored connection
- `/api/connections` → Create / inspect / delete connections
- `/api/files/*` → Upload and profile files
- `/api/lineage` → Parse SQL for lineage

## Frontend Architecture

**Key concepts:**
- **Next.js** for routing and SSR
- **Component library** built with Tailwind + Radix
- **State management** with Zustand and React Query

**Responsibilities:**
- Query orchestration (chat + SQL editor)
- Dataset exploration and profiling results
- Visualizations and table previews
- User settings and LLM configuration

## Database Schema (Supabase)

iOpsData uses Supabase for auth and metadata storage.

Suggested tables:
- `user_settings`
  - `user_id` (UUID)
  - `settings` (JSONB)
- `workspace_connections`
  - `workspace_id` (UUID)
  - `connection_name` (text)
  - `encrypted_config` (text)
- `file_assets`
  - `id` (UUID)
  - `storage_path` (text)
  - `metadata` (JSONB)

## LLM Integration Flow

1. User prompt is received by `/api/chat`.
2. Backend loads schema metadata and constructs a prompt.
3. Provider returns SQL + metadata.
4. SQL can be executed if `auto_execute` is enabled.

## File Processing Pipeline

1. User uploads a file to `/api/files/upload`.
2. File is stored in Supabase storage.
3. For profiling, `/api/files/profile` uses DuckDB to return column-level stats.

## Lineage Tracking System

- The `/api/lineage` endpoint parses SQL and returns:
  - tables read / written
  - columns used
  - CTEs
- Intended to power UI lineage graphs and impact analysis.

## Security Model

- **RLS (Supabase):** Enforce row-level policies per workspace.
- **Encryption:** All connection configs are encrypted with `FERNET_KEY`.
- **Least privilege:** Connections are read-only by default.
- **Auditability:** (Planned) query logging and change tracking.
