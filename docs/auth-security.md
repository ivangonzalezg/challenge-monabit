# Authentication & Security

## Overview

MonaBit uses **Better Auth** as its internal authentication library. Better Auth runs inside the MonaBit backend and stores all authentication data in the project's own PostgreSQL database via the Drizzle adapter. It is not an external hosted authentication provider — it is closer to a library like Passport.js, but with a complete auth schema, session management, and provider integration built in.

MonaBit is not using Firebase Auth, Supabase Auth, Auth0, or Clerk.

---

## Why Better Auth

Instead of manually implementing:
- custom password credential tables
- custom password hashing logic
- custom auth identity tables
- custom session token generation and validation
- custom Google OAuth handling

MonaBit delegates these to Better Auth, which is a maintained, security-focused authentication library. This reduces security risk, simplifies the codebase, and lets the implementation focus on the application domain (crypto dashboard, user management, roles, audit logs).

---

## What Better Auth owns

Better Auth manages the following concepts and their corresponding database tables. These are defined in `apps/api/src/db/schema.ts` using the Drizzle adapter and must match the schema Better Auth expects:

| Better Auth concept | Responsibility |
|---|---|
| `user` | Core user identity: `id`, `email`, `name`, `emailVerified`, `role`, `banned`, `banReason`, `banExpires` |
| `session` | Cookie-based sessions: token, user reference, expiry, IP, user agent, impersonation |
| `account` | Provider-linked accounts: email/password credentials, Google account linkage |
| `verification` | Email/magic-link verification tokens |

## What MonaBit owns

MonaBit extends the Better Auth user with application-level fields and maintains its own domain tables:

| MonaBit concept | Responsibility |
|---|---|
| `user.role` | Application-level role: `user` or `admin` |
| `user_profiles` | Extended profile: bio, country, timezone |
| `user_favorite_cryptos` | User-bookmarked crypto assets |
| `audit_logs` | Application audit trail for auth and admin events |
| `crypto_assets` | Local synchronized crypto market catalog |
| `crypto_market_kpis` | Global market KPIs |
| `crypto_sync_runs` | Sync operation log |

---

## User roles and ban state

Better Auth manages authentication. MonaBit manages application-level user state through the `role` field and Better Auth's native ban fields.

### Role

| Value | Meaning |
|---|---|
| `user` | Default. Can access the private dashboard. |
| `admin` | Can access user management endpoints. |

### Ban state

User blocking is handled natively by Better Auth's Admin plugin via three fields on the `user` table:

| Field | Type | Meaning |
|---|---|---|
| `banned` | `boolean` | Whether the user is currently banned |
| `banReason` | `text` | Optional reason for the ban |
| `banExpires` | `timestamp` | Optional expiry; `null` means permanent |

Banned users are rejected at the `requireAuth` middleware level with a `403`. There is no separate `status` field — ban state is the canonical lifecycle flag. Users are never hard- or soft-deleted.

---

## Session strategy

Better Auth uses **cookie-based sessions** for the browser application.

### Why cookies, not localStorage

- Secure HTTP-only cookies cannot be read by JavaScript, which reduces XSS exposure compared to storing tokens in `localStorage`.
- Cookies work correctly in incognito/private browsing sessions and are cleared automatically when the private session ends.
- Better Auth manages cookie creation, expiry, and rotation. No manual token generation or hashing is required.
- Bearer token auth can be considered later if MonaBit adds non-browser API clients (mobile apps, CLI tools).

---

## Authentication methods

### Email/password

Better Auth handles email/password registration and login through its `account` table and built-in credential management. Password storage and hashing are delegated entirely to Better Auth.

### Google login

Better Auth handles Google social login through its provider/account model. The Google account is linked in Better Auth's `account` table (`providerId = "google"`, `accountId = Google sub`). Google-only users do not require a local password.

---

## User management

User management is implemented at `apps/api/src/modules/users/users.router.ts`, mounted at `/api/admin/users`. All endpoints require `role = admin`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users (including banned) |
| `GET` | `/api/admin/users/:id` | Get a single user |
| `POST` | `/api/admin/users` | Create a user |
| `PATCH` | `/api/admin/users/:id` | Update name and/or role |
| `PATCH` | `/api/admin/users/:id/ban` | Ban or unban a user |

Ban/unban is delegated to `auth.api.banUser` and `auth.api.unbanUser` from Better Auth's Admin plugin. Users are never deleted.

### Request validation

All write endpoints use Zod schemas defined at the top of the router and applied via a shared `validate` middleware (`apps/api/src/lib/validate.ts`). On failure, the middleware returns the first validation error only:

```json
{ "error": "Invalid email", "field": "email" }
```

---

## Protected routes middleware

Implemented in `apps/api/src/lib/middleware.ts`:

- **`requireAuth`** — validates an active Better Auth session and rejects banned users with `403`.
- **`requireRole(role)`** — calls `requireAuth` then checks `user.role`.

---

## First admin bootstrap

On startup, `bootstrapFirstAdmin` (`apps/api/src/lib/bootstrap.ts`) runs before the server begins listening. If `FIRST_ADMIN_EMAIL` and `FIRST_ADMIN_PASSWORD` are set and no admin exists in the database, it creates the user and promotes them to `admin` role automatically.

| Variable | Required | Notes |
|---|---|---|
| `FIRST_ADMIN_EMAIL` | Yes | Email for the first admin account |
| `FIRST_ADMIN_PASSWORD` | Yes | Password (use a strong one) |
| `FIRST_ADMIN_NAME` | No | Display name, defaults to `Admin` |

The check is idempotent — if an admin already exists it does nothing, so the vars are safe to leave in across restarts. Once the admin is created you can remove them from your environment config.

---

## Auth endpoints

Better Auth is mounted at `/api/auth/*` in `apps/api/src/index.ts`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/sign-up/email` | POST | Register with email/password |
| `/api/auth/sign-in/email` | POST | Login with email/password |
| `/api/auth/sign-in/social` | POST | Login with Google |
| `/api/auth/sign-out` | POST | Logout, revoke session |
| `/api/auth/get-session` | GET | Validate session and return user |

---

## Audit logs

MonaBit maintains an `audit_logs` table for security and business events.

| Event | Trigger |
|---|---|
| `AUTH_REGISTER_SUCCESS` | Successful registration |
| `AUTH_LOGIN_SUCCESS` | Successful email/password login |
| `AUTH_LOGIN_FAILED` | Failed login attempt |
| `AUTH_GOOGLE_LOGIN_SUCCESS` | Successful Google login |
| `AUTH_LOGOUT` | User logout |
| `USER_CREATED` | Admin creates a user |
| `USER_UPDATED` | Admin updates name |
| `USER_ROLE_UPDATED` | Admin changes a user's role |
| `USER_BANNED` | Admin bans a user |
| `USER_UNBANNED` | Admin unbans a user |

Audit log rows reference `actor_user_id` and `target_user_id` using the Better Auth `user.id` as the canonical user identifier.

---

## Environment variables

```
# Database
DATABASE_URL=postgres://user:password@host:5432/monabit

# Better Auth
BETTER_AUTH_SECRET=example-secret-change-in-production
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=example-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=example-google-client-secret

# Server
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
PORT=3000
```

Never commit real values. All required keys are documented in `apps/api/.env.example`.

---

## Implementation status

| Area | Status |
|---|---|
| Schema design | Implemented |
| Better Auth setup | Implemented (`apps/api/src/lib/auth.ts`) |
| Auth routes | Implemented (mounted at `/api/auth/*`) |
| Session middleware | Implemented (`requireAuth`, `requireRole`) |
| Google provider config | Implemented (requires env vars) |
| Admin user management | Implemented (`/api/admin/users`) |
| Request validation (Zod) | Implemented (`validate` middleware) |
| First admin bootstrap | Implemented (`bootstrapFirstAdmin`) |
| Frontend auth flow | Not yet implemented |
