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
| Deployment (planned) | Google Cloud Run |

## Monorepo structure

```
monabit-dashboard/
├─ apps/
│  ├─ web/           React frontend
│  └─ api/           Express backend
├─ packages/
│  └─ shared/        Shared TypeScript types
├─ infra/            Dockerfiles and deployment notes
├─ docs/             Project documentation
├─ tsconfig.base.json
├─ .env.example
└─ package.json
```

## Requirements

- Node.js 20+
- Yarn 1.22.x (Classic)

## Local setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd monabit-dashboard

# 2. Install all workspace dependencies
yarn install

# 3. Copy and fill in environment variables
cp .env.example .env
# Edit .env and set COINGECKO_API_KEY and any other required values
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

## Backend health check

```bash
curl http://localhost:8080/health
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

See [.env.example](.env.example) for the full list. Key variables:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL consumed by the frontend |
| `PORT` | API port (default `8080`) |
| `WEB_ORIGIN` | Allowed CORS origin (default `http://localhost:5173`) |
| `CRYPTO_PROVIDER` | Active crypto provider (`coingecko`) |
| `COINGECKO_API_BASE_URL` | CoinGecko base URL |
| `COINGECKO_API_KEY` | CoinGecko API key (optional for demo tier) |

## Project status

**Base structure created.** The monorepo scaffold, shared types, crypto gateway interface, and documentation are in place.

## Next steps

1. Frontend internal architecture (routing, state management, component structure)
2. Backend internal architecture (module structure, error handling, middleware)
3. Authentication (email/password + Google OAuth)
4. Protected routes and auth middleware
5. User management (profile, preferences)
6. Crypto data gateway implementation (CoinGecko endpoints)
7. CoinGecko integration (market data, KPIs)
8. Persistence layer (database provider selection + schema)
9. Cloud Run deployment

## Documentation

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [Auth & Security](docs/auth-security.md)
- [Crypto Data Gateway](docs/crypto-data-gateway.md)
- [AI Usage](docs/ai-usage.md)
