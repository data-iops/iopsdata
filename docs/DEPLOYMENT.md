# Deployment Guide

This guide covers deploying iOpsData without Docker using Railway, Render, and Vercel.

## Backend: Railway (Recommended)

### Step-by-step

1. **Create a new Railway project**.
2. **Connect GitHub repo** and select the `backend/` directory as the service root.
3. **Configure build**:
   - Railway will detect `railway.json` and use Nixpacks.
4. **Set environment variables** (see table below).
5. **Deploy**.

### Screenshot description (for docs)
- Screenshot 1: Railway project dashboard with the service selected.
- Screenshot 2: Variables tab showing `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `FERNET_KEY`.
- Screenshot 3: Deploy logs showing `uvicorn` start command.

## Backend: Render (Alternative)

1. Create a new **Web Service**.
2. Connect your GitHub repo.
3. Set the root to `backend/`.
4. Render will use `render.yaml`:
   - Build: `pip install -e .`
   - Start: `uvicorn src.iopsdata.api.main:app --host 0.0.0.0 --port $PORT`
5. Add the environment variables and deploy.

## Frontend: Vercel

1. Import the repo into Vercel.
2. Set the root directory to `frontend/`.
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Custom Domain

1. Add your domain in the provider (Railway/Render/Vercel).
2. Configure DNS:
   - **A** record for the frontend
   - **CNAME** or **A** for the backend
3. Update environment variables if your API URL changes.

## Environment Variables Reference

| Variable | Description | Example |
| --- | --- | --- |
| `APP_ENV` | `dev` or `prod` | `prod` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `FERNET_KEY` | Encryption key for stored connections | `Z0FBQU...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `...` |
| `NEXT_PUBLIC_API_URL` | Public API base URL | `https://api.iopsdata.io` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL for frontend | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for frontend | `eyJ...` |

## Post-Deployment Checklist

- [ ] `/health` returns `{"status": "ok"}`
- [ ] Frontend loads without console errors
- [ ] Supabase auth works
- [ ] File uploads succeed
- [ ] LLM provider shows as configured

## Monitoring & Logs

- **Railway:** Use the deploy logs and metrics tab.
- **Render:** Use logs + metrics from the service dashboard.
- **Vercel:** Use build logs and runtime logs in the project dashboard.

For production deployments, configure alerting in your hosting platform and monitor request latency and error rates.
