# API Reference

Base URL: `http://localhost:8000`

All API routes are under `/api`.

## Authentication

Authentication is handled via Supabase. Clients should include a valid Supabase JWT in the `Authorization` header for endpoints that require user context (e.g., `/api/auth/me`, `/api/settings`).

```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

**GET** `/health`

**Response**

```json
{
  "status": "ok"
}
```

---

### List LLM Providers

**GET** `/api/providers`

**Response**

```json
{
  "providers": ["openai", "anthropic"]
}
```

**Errors**
- `500` if provider loading fails.

---

### Chat (NL-to-SQL)

**POST** `/api/chat`

**Request**

```json
{
  "connection_id": "warehouse",
  "prompt": "Top 10 customers by revenue",
  "provider": "openai",
  "auto_execute": true,
  "dialect": "postgresql"
}
```

**Response**

```json
{
  "sql": "SELECT ...",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "tokens": { "prompt": 120, "completion": 90, "total": 210 },
  "results": {
    "columns": ["customer", "revenue"],
    "rows": [["Acme", 1000]],
    "row_count": 1
  }
}
```

**Errors**
- `404` if the connection does not exist.
- `400` if the provider is not configured.

---

### Execute SQL

**POST** `/api/execute`

**Request**

```json
{
  "connection_id": "warehouse",
  "sql": "SELECT COUNT(*) FROM orders"
}
```

**Response**

```json
{
  "results": {
    "columns": ["count"],
    "rows": [[123]],
    "row_count": 1
  }
}
```

**Errors**
- `404` if the connection does not exist.

---

### Create Connection

**POST** `/api/connections`

**Request**

```json
{
  "provider": "postgres",
  "name": "warehouse",
  "config": {
    "host": "db.example.com",
    "database": "analytics",
    "user": "readonly",
    "password": "..."
  }
}
```

**Response**

```json
{
  "name": "warehouse",
  "provider": "postgres",
  "status": {"state": "ready"}
}
```

---

### Get Connection

**GET** `/api/connections/{connection_id}`

**Response**

```json
{
  "name": "warehouse",
  "provider": "PostgresConnection",
  "status": {"state": "ready"}
}
```

**Errors**
- `404` if the connection does not exist.

---

### Delete Connection

**DELETE** `/api/connections/{connection_id}`

**Response**

```json
{ "status": "disconnected" }
```

---

### Upload File

**POST** `/api/files/upload?bucket=uploads`

**Request**
- Multipart form data with `file`.

**Response**

```json
{
  "file_name": "customers.csv",
  "storage_path": "uploads/customers.csv",
  "content_type": "text/csv",
  "size_bytes": 10240
}
```

---

### Profile File

**POST** `/api/files/profile`

**Request**
- Multipart form data with `file`.

**Response**

```json
{
  "row_count": 120,
  "columns": [
    {"name": "id", "type": "INTEGER", "nulls": 0}
  ]
}
```

---

### Parse Lineage

**POST** `/api/lineage`

**Request**

```json
{
  "sql": "SELECT * FROM customers",
  "dialect": "postgresql"
}
```

**Response**

```json
{
  "query_type": "SELECT",
  "tables_read": ["customers"],
  "tables_written": [],
  "columns_used": ["*"],
  "ctes": []
}
```

---

### Current User

**GET** `/api/auth/me`

**Response**

```json
{ "id": "...", "email": "user@example.com" }
```

---

### User Settings

**GET** `/api/settings`

**Response**

```json
{
  "user_id": "...",
  "settings": {
    "theme": "dark"
  }
}
```

## Error Codes

| Status | Meaning |
| --- | --- |
| 400 | Bad request / invalid payload |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 500 | Server error |

## Rate Limiting

Rate limiting is not enforced by default. Deployments should configure limits at the edge (e.g., Vercel, Cloudflare, or an API gateway).

## Webhooks

No webhooks are implemented in the current release.
