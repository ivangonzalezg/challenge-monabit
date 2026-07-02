# Cloud Run Deployment

## Overview

MarketMint is deployed as a **single Google Cloud Run service**.

The Express API serves the compiled Vite/React SPA as static files and handles API routes from the same origin. This means the production app can be tested through a single public URL.

| Service | Source | Notes |
|---|---|---|
| `monabit` | `infra/Dockerfile` | Runs the Express API and serves the built React SPA from the same Cloud Run service. |

## Public URLs

| Type | URL |
|---|---|
| Cloud Run URL | `https://monabit-873418601776.us-central1.run.app` |

The Cloud Run URL is the direct production endpoint. The custom domain points to the same service and can depend on DNS propagation.

## Single-Service Deployment Model

The production runtime works as follows:

1. The React app is built with Vite.
2. The compiled frontend assets are served by Express.
3. Express handles API routes under `/api/*`.
4. Express returns `index.html` for non-API routes so React can handle client-side routing.
5. Cloud Run exposes the service through HTTPS.

This removes the need for a separate backend URL in the delivery. The same service acts as both the API server and the static web server.

## API Routing

- API routes: `/api/*`
- SPA routes: any non-API route
- Health check: `GET /api/health`
- Swagger documentation: served by the backend under the configured API documentation route

## Cloud Run Requirements

Cloud Run injects a `PORT` environment variable. The Express server must listen on that port.

For local execution, a default port can be provided through environment variables.

## Build-Time Configuration

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Optional frontend build-time API URL. It can be left empty when the frontend and API share the same origin. |

For this deployment, same-origin relative API calls are preferred because both the SPA and API are served by the same Cloud Run service.

## Runtime Configuration

Runtime configuration is injected through Cloud Run environment variables and Google Cloud Secret Manager.

| Variable | Where to configure |
|---|---|
| `PORT` | Injected automatically by Cloud Run. |
| `NODE_ENV` | Cloud Run environment variable, usually `production`. |
| `CORS_ORIGIN` | Cloud Run environment variable. |
| `WEB_ORIGIN` | Cloud Run environment variable. |
| `DATABASE_URL` | Cloud Run secret from Secret Manager. |
| `BETTER_AUTH_SECRET` | Cloud Run secret from Secret Manager. |
| `BETTER_AUTH_URL` | Cloud Run environment variable using the public service URL. |
| `GOOGLE_CLIENT_ID` | Cloud Run environment variable. |
| `GOOGLE_CLIENT_SECRET` | Cloud Run secret from Secret Manager. |
| `RESEND_API_KEY` | Cloud Run secret from Secret Manager. |
| `RESEND_FROM_EMAIL` | Cloud Run environment variable. |
| `CRYPTO_PROVIDER` | Cloud Run environment variable. |
| `COINGECKO_API_BASE_URL` | Cloud Run environment variable. |
| `COINGECKO_API_KEY` | Cloud Run secret from Secret Manager. |
| `CRYPTO_SYNC_INTERVAL_MINUTES` | Cloud Run environment variable. |
| `CRYPTO_SNAPSHOT_RETENTION_DAYS` | Cloud Run environment variable. |
| `FIRST_ADMIN_EMAIL` | Cloud Run environment variable for first admin bootstrap. |
| `FIRST_ADMIN_PASSWORD` | Cloud Run secret for first admin bootstrap. |
| `FIRST_ADMIN_NAME` | Optional Cloud Run environment variable. |

## Secret Management

Sensitive values are stored in Google Cloud Secret Manager and mounted into the Cloud Run service as environment variables.

Sensitive values include:

- Database credentials.
- Better Auth secret.
- Google OAuth client secret.
- Resend API key.
- CoinGecko API key.
- First admin bootstrap password.

The repository contains example environment files only. Real secrets are not committed.

## CI/CD

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

On push to the `main` branch, the workflow:

1. Builds the Docker image using `infra/Dockerfile`.
2. Pushes the image to Artifact Registry.
3. Deploys the image to Cloud Run.
4. Authenticates to Google Cloud using Workload Identity Federation.

This avoids storing long-lived Google Cloud service account keys in GitHub.

## One-Time GCP Setup

The deployment assumes the following Google Cloud resources exist:

1. Artifact Registry Docker repository.
2. Google Cloud service account for deployment.
3. IAM permissions for Cloud Run deployment, Artifact Registry writes, and service account usage.
4. Workload Identity Federation pool and provider trusting the GitHub repository.
5. GitHub repository variables for deployment identifiers, such as project ID, region, Artifact Registry repository, workload identity provider, and service account.
6. Secret Manager entries for runtime secrets.

## Health Check

Cloud Run can use `GET /api/health` as a startup or liveness probe.

The health endpoint provides a lightweight way to validate that the service is running and responding.
