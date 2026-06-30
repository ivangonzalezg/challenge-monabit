# MonaBit Crypto Dashboard

A full-stack crypto market dashboard built as a technical challenge. The project is organized as a Yarn workspace monorepo with a React frontend, a Node.js/Express backend, and a shared TypeScript types package.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Backend | Node.js, Express 5, TypeScript, nodemon |
| Shared types | TypeScript (no compiled output) |
| Monorepo | Yarn workspaces |
| Crypto provider | CoinGecko |
| Deployment | Google Cloud Run |

## Monorepo structure

```
challenge-monabit/
├─ apps/
│  ├─ web/           React frontend
│  └─ api/           Express backend
├─ packages/
│  └─ shared/        Shared TypeScript types
├─ infra/            Dockerfiles and deployment notes
├─ docs/             Project documentation
├─ tsconfig.base.json
└─ package.json
```

## Requirements

- Node.js 20+
- Yarn 1.22.x (Classic)

## Local setup

```bash
# 1. Clone the repository
git clone https://github.com/ivangonzalezg/challenge-monabit.git
cd challenge-monabit

# 2. Install all workspace dependencies
yarn install

# 3. Copy and fill in environment variables for each app
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit each .env file and fill in the required values
```

## Running locally

```bash
# Start both frontend and backend in parallel
yarn dev

# Or start individually
yarn dev:web    # http://localhost:5173
yarn dev:api    # http://localhost:8080
```

## Main commands

| Command | Description |
|---|---|
| `yarn install` | Install all workspace dependencies |
| `yarn dev` | Start frontend + backend (parallel) |
| `yarn dev:web` | Start frontend only |
| `yarn dev:api` | Start backend only |
| `yarn build` | Build all packages |
| `yarn typecheck` | Type-check all packages |
| `yarn lint` | Lint all packages |

## Database

The API uses **Drizzle ORM** with PostgreSQL. You only need a connection string — no extra tooling required.

Set `DATABASE_URL` in `apps/api/.env`:

```
DATABASE_URL=postgres://user:password@host:5432/monabit
```

Any standard PostgreSQL URL works: local Docker, Supabase, Neon, Railway, etc.

### Running Postgres locally with Docker

If you don't have a PostgreSQL instance, you can spin one up with Docker:

```bash
docker compose -f infra/docker-compose.yml up -d
```

This starts a Postgres 16 container on port `5432`. Use this connection string:

```
DATABASE_URL=postgres://monabit:monabit@localhost:5432/monabit
```

To stop it:

```bash
docker compose -f infra/docker-compose.yml down
```

To stop and delete all data:

```bash
docker compose -f infra/docker-compose.yml down -v
```

### Database migrations

The project uses versioned migrations — never push schema changes directly. The workflow is:

1. Edit `apps/api/src/db/schema.ts`
2. Generate the migration file (SQL diff from your last migration):
   ```bash
   yarn workspace @monabit/api db:generate
   ```
3. Review the generated `.sql` file in `apps/api/src/db/migrations/`
4. Apply it to your database:
   ```bash
   yarn workspace @monabit/api db:migrate
   ```

Drizzle tracks which migrations have been applied in a `__drizzle_migrations` table, so `db:migrate` only runs files that haven't been applied yet.

**First time setup** — after cloning and setting `DATABASE_URL`, apply all existing migrations:

```bash
yarn workspace @monabit/api db:migrate
```

## First admin setup

On first deploy, set these three environment variables to automatically create the first admin user on startup:

| Variable | Description |
|---|---|
| `FIRST_ADMIN_EMAIL` | Email for the first admin account |
| `FIRST_ADMIN_PASSWORD` | Password for the first admin account (use a strong one) |
| `FIRST_ADMIN_NAME` | Display name (optional, defaults to `Admin`) |

The bootstrap runs before the server starts. If an admin already exists it does nothing, so these vars are safe to leave in place across restarts. Once the admin is created you can remove them from your environment config.

## Backend health check

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "monabit-api",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment variables

See [apps/api/.env.example](apps/api/.env.example) and [apps/web/.env.example](apps/web/.env.example) for the full list. Key variables:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Public URL of the API consumed by the frontend (default `http://localhost:8080`) |
| `PORT` | API port (default `8080`) |
| `NODE_ENV` | Runtime environment (`development` / `production`) |
| `CORS_ORIGIN` | Allowed CORS origin (default `http://localhost:5173`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret for auth token signing (min 32 chars) |
| `BETTER_AUTH_URL` | Public URL of the API used by Better Auth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CRYPTO_PROVIDER` | Crypto data provider (default `coingecko`) |
| `COINGECKO_API_BASE_URL` | CoinGecko base URL |
| `COINGECKO_API_KEY` | CoinGecko API key |
| `CRYPTO_SYNC_SECRET` | Internal secret for the crypto sync endpoint |
| `CRYPTO_SYNC_INTERVAL_MINUTES` | How often crypto data is synced in minutes (default `5`) |
| `FIRST_ADMIN_EMAIL` | Email for the first admin (bootstrap only, optional) |
| `FIRST_ADMIN_PASSWORD` | Password for the first admin (bootstrap only, optional) |
| `FIRST_ADMIN_NAME` | Display name for the first admin (bootstrap only, defaults to `Admin`) |

## Project status

**Base structure created.** The monorepo scaffold, shared types, crypto gateway interface, and documentation are in place.

## Next steps

1. Frontend internal architecture (routing, state management, component structure)
2. Backend internal architecture (module structure, error handling, middleware)
3. Authentication (email/password + Google OAuth)
4. Protected routes and auth middleware
5. User management (profile)
6. Crypto data gateway implementation (CoinGecko endpoints)
7. CoinGecko integration (market data, KPIs)
8. Persistence layer (database provider selection + schema)
9. Cloud Run deployment

## Documentation

- [Architecture](docs/architecture.md)
- [Database Schema](docs/schema.md)
- [Auth & Security](docs/auth-security.md)
- [Crypto Data Gateway](docs/crypto-data-gateway.md)
- [AI Usage](docs/ai-usage.md)
