# Security Policy

## Supported Versions

We currently support the latest `main` branch and the most recent tagged release.

## Reporting a Vulnerability

Please report security vulnerabilities privately. **Do not open a public GitHub issue.**

- Email: **security@iopsdata.io**
- Include: steps to reproduce, affected components, and any potential impact.

We aim to acknowledge reports within 72 hours.

## Security Best Practices for Deployment

- Use HTTPS everywhere.
- Restrict `CORS_ORIGINS` in production.
- Keep `FERNET_KEY` secret and rotate if compromised.
- Use minimal privileges for database users.
- Store secrets in your hosting platform’s secret manager.

## Data Handling

iOpsData stores:
- Encrypted connection metadata (using `FERNET_KEY`)
- Supabase user settings (JSON)
- Uploaded files (if enabled)

We do **not** store LLM prompts or responses by default.
