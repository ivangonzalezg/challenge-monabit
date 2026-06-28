# Database

## Status

The database provider has **not been finalized** in this setup step.

## Options under consideration

The technical challenge permits either **Firestore** or **Supabase (PostgreSQL)**. This project is not using Supabase at this stage. The final choice will be documented here once decided.

## Expected data model

The following entities are likely to be persisted depending on final product decisions:

| Entity | Notes |
|---|---|
| Users / Profiles | Identity and display preferences |
| Crypto favorites | Per-user list of tracked assets |
| User preferences | Theme, currency, locale, etc. |
| Cached market snapshots | Optional server-side caching to reduce provider API calls |
| Audit logs | Optional security/activity trail |

## Next steps

- Select database provider (Firestore vs. PostgreSQL).
- Define schema / data model.
- Document migration strategy.
- Add connection setup to `apps/api`.
