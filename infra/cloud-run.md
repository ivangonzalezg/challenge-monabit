# Cloud Run Deployment

## Overview

The application is deployed as a **single Cloud Run service**: the Express API serves the compiled Vite SPA as static files, with a fallback route for client-side routing.

| Service | Source | Notes |
|---|---|---|
| `monabit` | `infra/Dockerfile` | Runs the Express API and serves the built SPA from the same origin |

## API requirements

- The service must listen on the port provided by the `PORT` environment variable (Cloud Run injects this automatically; default `8080`).
- All non-`/api/*` routes fall back to `index.html` so client-side routing works on refresh/direct navigation.

## Build-time configuration

- `VITE_API_URL` — passed as a Docker build-arg (`--build-arg VITE_API_URL=...`). Leave unset/empty for same-origin relative `/api/...` calls (the default, since the SPA and API share one Cloud Run service). Only set this if the frontend needs to call a different origin.

## Environment variables

All runtime configuration is injected through Cloud Run environment variables or **Secret Manager**. Never commit real secrets to the repository.

| Variable | Where to configure |
|---|---|
| `PORT` | Injected automatically by Cloud Run |
| `NODE_ENV` | Cloud Run environment variable (`production`) |
| `CORS_ORIGIN` | Cloud Run environment variable |
| `WEB_ORIGIN` | Cloud Run environment variable |
| `DATABASE_URL` | Cloud Run secret (Secret Manager) |
| `BETTER_AUTH_SECRET` | Cloud Run secret (Secret Manager) |
| `BETTER_AUTH_URL` | Cloud Run environment variable (public service URL) |
| `GOOGLE_CLIENT_ID` | Cloud Run environment variable |
| `GOOGLE_CLIENT_SECRET` | Cloud Run secret (Secret Manager) |
| `RESEND_API_KEY` | Cloud Run secret (Secret Manager) |
| `RESEND_FROM_EMAIL` | Cloud Run environment variable |
| `CRYPTO_PROVIDER` | Cloud Run environment variable |
| `COINGECKO_API_BASE_URL` | Cloud Run environment variable |
| `COINGECKO_API_KEY` | Cloud Run secret (Secret Manager) |
| `CRYPTO_SYNC_INTERVAL_MINUTES` | Cloud Run environment variable |
| `CRYPTO_SNAPSHOT_RETENTION_DAYS` | Cloud Run environment variable |
| `FIRST_ADMIN_EMAIL` | Cloud Run environment variable (remove after first deploy) |
| `FIRST_ADMIN_PASSWORD` | Cloud Run secret (remove after first deploy) |
| `FIRST_ADMIN_NAME` | Cloud Run environment variable (optional) |

## Secrets

Sensitive values (API keys, database credentials, auth secrets) must be stored in **Google Cloud Secret Manager** and mounted as environment variables in the Cloud Run service definition. Do not set them as plain-text environment variables in CI/CD pipelines or Dockerfiles.

## Health check

Cloud Run can be configured to use `GET /api/health` as a startup and liveness probe.

## CI/CD

See `.github/workflows/deploy.yml` — builds `infra/Dockerfile`, pushes to Artifact Registry, and deploys to Cloud Run on push to `main`, authenticating via Workload Identity Federation (no long-lived GCP keys stored in GitHub).

### One-time GCP setup (outside this repo)

1. Create an Artifact Registry Docker repository.
2. Create a GCP service account with `roles/run.admin`, `roles/iam.serviceAccountUser`, and `roles/artifactregistry.writer` on the target project.
3. Create a Workload Identity Federation pool + provider trusting this GitHub repo, and bind it to the service account.
4. Add two **repository variables** (not secrets — these are identifiers, not credentials) in GitHub: `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT`.
5. Add repository variables for `GCP_PROJECT_ID`, `GCP_REGION`, and `ARTIFACT_REGISTRY_REPO`.
