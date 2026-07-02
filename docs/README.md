# MarketMint Technical Documentation

This folder contains the supporting technical documentation for the MarketMint dashboard.

## Documents

| Document | Purpose |
|---|---|
| [`architecture.md`](./architecture.md) | General architecture, monorepo structure, runtime flow, and key technical decisions. |
| [`auth-security.md`](./auth-security.md) | Authentication, session strategy, role-based authorization, user management, first admin setup, and security practices. |
| [`cloud-run.md`](./cloud-run.md) | Google Cloud Run deployment model, CI/CD flow, custom domain notes, and runtime configuration. |
| [`crypto-data-gateway.md`](./crypto-data-gateway.md) | Crypto provider abstraction, CoinGecko integration, gateway design, and provider replacement strategy. |
| [`environment-variables.md`](./environment-variables.md) | Required environment variables, example values, local setup, production setup, and secret handling. |
| [`schema.md`](./schema.md) | Database model, tables, relationships, synchronization data model, access rules, and persistence strategy. |
| [`schema.dbml`](./schema.dbml) | DBML representation of the database schema for visualization in dbdiagram.io or similar tools. |
| [`ai-usage.md`](./ai-usage.md) | Summary of AI tools used, how they supported the work, and which decisions were made manually. |
| [`known-limitations.md`](./known-limitations.md) | Known limitations, trade-offs, and future improvements. |

## Public URLs

- Cloud Run URL: `https://monabit-873418601776.us-central1.run.app`

The Cloud Run URL is the canonical production URL. The custom domain points to the same Cloud Run service and may depend on DNS propagation.

## API Notes

The application is deployed as a single service. Express serves both the API and the compiled React SPA:

- API routes are mounted under `/api`.
- Non-API routes fall back to the React `index.html` file.
- The frontend uses same-origin API calls by default.

Useful runtime endpoints:

- Health check: `GET /api/health`
- API documentation: Swagger UI, mounted under the API documentation route configured in the backend.
