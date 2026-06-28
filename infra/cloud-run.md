# Cloud Run Deployment

## Overview

The frontend and backend are deployed as **separate Cloud Run services**:

| Service | Source | Notes |
|---|---|---|
| `monabit-web` | `infra/web.Dockerfile` | Serves the compiled Vite SPA |
| `monabit-api` | `infra/api.Dockerfile` | Runs the Express API |

## API requirements

- The API must listen on the port provided by the `PORT` environment variable (Cloud Run injects this automatically; default `8080`).
- Set `WEB_ORIGIN` to the deployed frontend URL so CORS is configured correctly.

## Environment variables

All runtime configuration is injected through Cloud Run environment variables or **Secret Manager**. Never commit real secrets to the repository.

| Variable | Where to configure |
|---|---|
| `PORT` | Injected automatically by Cloud Run |
| `WEB_ORIGIN` | Cloud Run environment variable |
| `CRYPTO_PROVIDER` | Cloud Run environment variable |
| `COINGECKO_API_BASE_URL` | Cloud Run environment variable |
| `COINGECKO_API_KEY` | Cloud Run secret (Secret Manager) |

## Secrets

Sensitive values (API keys, database credentials, auth secrets) must be stored in **Google Cloud Secret Manager** and mounted as environment variables in the Cloud Run service definition. Do not set them as plain-text environment variables in CI/CD pipelines or Dockerfiles.

## Health check

Cloud Run can be configured to use `GET /health` on the API service as a startup and liveness probe.
