# Environment Variables

## Overview

MarketMint uses environment variables for local development, production deployment, authentication, database access, crypto provider integration, transactional email, and first administrator bootstrap.

Real secrets are not committed to the repository. The repository should only contain `.env.example` files with safe example values.

## Local Development

Local development uses example environment files for the API and frontend. The local database can run through Docker Compose using PostgreSQL.

Typical local setup flow:

1. Install dependencies with Yarn.
2. Copy example environment files.
3. Start PostgreSQL with Docker Compose.
4. Generate or apply database migrations.
5. Start the API and web development servers.

## API Environment Variables

| Variable | Required | Example | Purpose |
|---|---:|---|---|
| `DATABASE_URL` | Yes | `postgres://user:password@localhost:5432/monabit` | PostgreSQL/Supabase database connection string. |
| `BETTER_AUTH_SECRET` | Yes | `example-secret-change-in-production` | Secret used by Better Auth. Must be strong in production. |
| `BETTER_AUTH_URL` | Yes | `http://localhost:3000` | Public backend/application URL used by Better Auth. |
| `GOOGLE_CLIENT_ID` | Yes for Google login | `example.apps.googleusercontent.com` | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Yes for Google login | `example-google-client-secret` | Google OAuth client secret. |
| `RESEND_API_KEY` | Required for email flows | `re_change-me` | Resend API key for transactional emails. |
| `RESEND_FROM_EMAIL` | Required for email flows | `MarketMint <onboarding@resend.dev>` | Sender address for transactional emails. |
| `FIRST_ADMIN_EMAIL` | First admin bootstrap | `admin@example.com` | Email for the first administrator account. |
| `FIRST_ADMIN_PASSWORD` | First admin bootstrap | `change-me-strong-password` | Password for the first administrator account. |
| `FIRST_ADMIN_NAME` | Optional | `Admin` | Display name for the first administrator. |
| `CORS_ORIGIN` | Yes | `http://localhost:5173` | Allowed frontend origin during local development or split-origin deployments. |
| `WEB_ORIGIN` | Yes | `http://localhost:5173` | Public frontend origin used for auth redirects and email links. |
| `NODE_ENV` | Yes | `development` | Runtime environment. |
| `PORT` | Yes | `3000` | API/server port. In Cloud Run this is injected automatically. |
| `CRYPTO_PROVIDER` | Yes | `coingecko` | Active crypto provider. |
| `COINGECKO_API_BASE_URL` | Yes | `https://api.coingecko.com/api/v3` | CoinGecko API base URL. |
| `COINGECKO_API_KEY` | Depends on provider usage | `example-coingecko-api-key` | CoinGecko Demo or Pro API key. |
| `CRYPTO_SYNC_INTERVAL_MINUTES` | Yes | `5` | Crypto synchronization interval in minutes. |
| `CRYPTO_SNAPSHOT_RETENTION_DAYS` | Yes | `180` | Retention period for historical crypto asset snapshots. |

## Frontend Environment Variables

| Variable | Required | Example | Purpose |
|---|---:|---|---|
| `VITE_API_URL` | Optional | empty or `http://localhost:3000/api` | Frontend API base URL. It can be omitted for same-origin production calls. |

For the Cloud Run deployment, the frontend and backend share the same origin, so the frontend can use relative `/api` calls.

## First Admin Bootstrap

The first admin bootstrap flow creates an administrator account during startup when no admin exists.

Required variables:

- `FIRST_ADMIN_EMAIL`
- `FIRST_ADMIN_PASSWORD`

Optional variable:

- `FIRST_ADMIN_NAME`

The bootstrap process is idempotent. If an administrator already exists, no new admin is created.

After the first administrator has been created, the bootstrap variables can be removed from the runtime environment.

## Production Secret Handling

Production uses two types of configuration:

### Plain Environment Variables

Non-sensitive configuration can be stored directly as Cloud Run environment variables.

Examples:

- `NODE_ENV`
- `BETTER_AUTH_URL`
- `WEB_ORIGIN`
- `CORS_ORIGIN`
- `CRYPTO_PROVIDER`
- `COINGECKO_API_BASE_URL`
- `CRYPTO_SYNC_INTERVAL_MINUTES`
- `CRYPTO_SNAPSHOT_RETENTION_DAYS`

### Secret Manager Values

Sensitive values are stored in Google Cloud Secret Manager and mounted into Cloud Run.

Examples:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `COINGECKO_API_KEY`
- `FIRST_ADMIN_PASSWORD`

## CI/CD Configuration

The GitHub Actions workflow uses repository variables and secrets for deployment.

Typical repository variables:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `ARTIFACT_REGISTRY_REPO`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

These values identify the deployment target and Workload Identity Federation setup. They are not application runtime secrets.

## Security Notes

- Do not commit real `.env` files.
- Keep `.env.example` files updated with safe placeholders.
- Use Secret Manager for production secrets.
- Use GitHub Secrets only for CI/CD secrets that must be accessed by the workflow.
- Avoid writing secrets in Dockerfiles, build args, logs, or README examples.
