# Vercel Deployment Guide

## Architecture

GrantFlow uses **split deployment**:
- **Vercel**: Static React client (SPA)
- **Separate host**: Express API server (Railway, Render, Fly.io, etc.)

Vercel serves only the frontend. All `/api/*` requests must go to your deployed backend.

## Setup Checklist

### 1. Deploy the API server first

Deploy the Express server (`server/`) to Railway, Render, Fly.io, or similar. Ensure it has:
- `JWT_SECRET` (required)
- `PORT` (optional, defaults to 3001)
- Database (SQLite file or PostgreSQL if configured)

### 2. Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Create a new project and import the Grant-Flow repository.
3. Vercel auto-detects `vercel.json` and uses it for build settings.

### 3. Set `VITE_API_URL` in Vercel

**Required** for production. Without this, API calls will 404.

1. In Vercel: Project → **Settings** → **Environment Variables**
2. Add: `VITE_API_URL` = `https://your-api-domain.com` (no trailing slash)
3. Apply to **Production**, **Preview**, and **Development**.
4. Redeploy so the build picks up the variable.

### 4. CORS on the API server

Set `CORS_ORIGIN` on your API server to a comma-separated list including your Vercel URL(s), e.g.:
```
CORS_ORIGIN=https://your-app.vercel.app,https://your-app-*.vercel.app
```
Without this, browser requests from the Vercel-hosted client will be blocked.

## Build Configuration

The `vercel.json` is already configured to:
- Build the client only: `npm run build -w client`
- Output from `client/dist`
- Rewrite non-API routes to `index.html` for SPA routing

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on API calls | Set `VITE_API_URL` in Vercel env vars and redeploy |
| Build fails | Ensure `npm install` runs at root (monorepo); `-w client` builds only the client workspace |
| CORS errors | Add your Vercel domain to allowed origins on the API server |
| Auth works but data doesn't | `apiFetch` and auth both use `VITE_API_URL`; verify it's set and correct |
