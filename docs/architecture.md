# Architecture

## Overview

MonaBit Dashboard is organized as a **Yarn workspace monorepo**. The repository is split into apps and shared packages so each concern can evolve independently while sharing common types.

## Workspace structure

```
monabit-dashboard/
├─ apps/
│  ├─ web/          React frontend (Vite + TypeScript)
│  └─ api/          Node.js / Express backend (TypeScript)
├─ packages/
│  └─ shared/       Shared TypeScript types consumed by both apps
├─ infra/           Deployment artifacts (Dockerfiles, Cloud Run notes)
└─ docs/            Project documentation
```

### `apps/web`

React 19 SPA built with Vite. Communicates with the backend exclusively through HTTP; it never calls crypto provider APIs directly.

### `apps/api`

Express 5 HTTP server. Exposes application data to the frontend and acts as the single integration point for external services (crypto providers, database, auth). Runs in development with `nodemon` + `tsx` for hot reload.

### `packages/shared`

TypeScript-only package (no compiled output). Contains domain types shared between the frontend and the backend. Neither app depends on the other; both depend on `@monabit/shared`.

### `infra`

Dockerfiles and deployment notes for Cloud Run. No secrets are stored here.

## Internal architectures

The internal structure of `apps/web` and `apps/api` will be defined in subsequent steps once the core feature set is agreed.

## Data flow (planned)

```
Browser → apps/web → HTTP → apps/api → Crypto Gateway → CoinGecko API
                                     ↓
                                  Database (TBD)
```
