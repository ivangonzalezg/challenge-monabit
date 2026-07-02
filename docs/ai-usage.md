# AI Usage

## Overview

AI tools were used during the development of MarketMint as engineering support. They were used to accelerate scaffolding, documentation, implementation, and review, while technical decisions remained under human control.

The goal was not to delegate the complete solution to AI, but to use AI as a development assistant for repetitive work, code generation, architectural exploration, and documentation support.

## Tools Used

| Tool | Usage |
|---|---|
| Claude Code | Scaffolding support, project structure, documentation drafting, schema exploration, and analysis. |
| OpenAI Codex | Code implementation support, repetitive development tasks, backend and frontend implementation assistance. |
| ChatGPT | Reasoning support, challenge interpretation, documentation refinement, delivery preparation, and technical review. |

## How AI Was Used

AI tools supported the following areas:

- Initial monorepo planning.
- Workspace structure exploration.
- Database schema design and iteration.
- Documentation drafting before and during implementation.
- Backend implementation assistance.
- Frontend UI implementation support.
- Repetitive code generation tasks.
- Review of architectural alternatives.
- Delivery checklist preparation.
- Technical writing refinement.

## Human Technical Decisions

The main technical decisions were made manually, including:

- Building the project as a Yarn workspace monorepo.
- Using React/Vite for the frontend.
- Using Node.js/Express for the backend.
- Serving the compiled React SPA from Express.
- Deploying the application as a single Cloud Run service.
- Using Supabase/PostgreSQL for production persistence.
- Using Docker Compose with PostgreSQL for local development.
- Using Better Auth for authentication.
- Using cookie-based browser sessions instead of localStorage tokens.
- Adding administrator roles and role-based route protection.
- Adding the first admin bootstrap mechanism.
- Designing the crypto integration as a provider gateway.
- Choosing CoinGecko as the initial crypto data provider.
- Persisting crypto assets, snapshots, KPIs, favorites, and audit logs.
- Adding Swagger API documentation.
- Adding CI/CD to Cloud Run on pushes to `main`.
- Prioritizing optional features such as roles, audit logs, backend tests, dark mode, search, favorites, and health checks.

## UI Support

The frontend uses shadcn/ui components to speed up UI construction and maintain a consistent interface. AI support was used to generate and adjust UI implementation details, but the visual direction, screen requirements, data needs, and interaction decisions were defined manually.

## Documentation Support

AI was also used to draft and refine documentation. This helped keep architecture, schema, security, deployment, and delivery notes clear and consistent.

Documentation was reviewed and adjusted to match the actual project implementation.

## Risks Considered

AI-generated output can contain mistakes, incorrect assumptions, outdated patterns, or code that does not match the intended architecture.

The main risks considered were:

- Security-sensitive code requiring manual review.
- Incorrect assumptions about Better Auth or provider behavior.
- Generated code drifting away from the intended architecture.
- Overengineering beyond the challenge scope.
- Documentation becoming inconsistent with the implemented code.
- Missing edge cases in generated code.

## Mitigation

To reduce these risks:

- The project was documented before and during implementation.
- AI outputs were treated as drafts or implementation assistance, not final authority.
- Technical decisions were reviewed manually.
- Security-sensitive areas such as authentication, roles, sessions, secrets, and protected routes were reviewed carefully.
- The final delivery was checked against the challenge requirements.
