# Authentication & Security

## Overview

MarketMint uses **Better Auth** as its internal authentication library. Better Auth runs inside the MarketMint backend and stores authentication data in the project database through the Drizzle adapter.

MarketMint does not use Firebase Auth, Supabase Auth, Auth0, or Clerk. Authentication is owned by the backend application while relying on Better Auth for secure credential handling, session management, OAuth integration, password reset, email verification, and administrator user-management endpoints.

## Why Better Auth

Better Auth reduces the amount of security-sensitive code that has to be written manually. Instead of implementing custom password tables, password hashing, session token generation, OAuth handling, and verification flows from scratch, MarketMint delegates those responsibilities to a maintained authentication library.

This keeps the application code focused on the challenge domain: the crypto dashboard, user management, roles, audit logs, crypto synchronization, and dashboard data delivery.

## Better Auth Responsibilities

Better Auth owns the following authentication concepts and their database tables:

| Better Auth concept | Responsibility |
|---|---|
| `user` | Core user identity, including email, name, verification state, role, and ban fields. |
| `session` | Cookie-based sessions, token metadata, expiry, IP address, user agent, and user reference. |
| `account` | Provider-linked accounts, including email/password credentials and Google account linkage. |
| `verification` | Verification records used for email verification, password reset, and related token flows. |

These tables are defined through the backend schema and must match Better Auth expectations.

## MarketMint Responsibilities

MarketMint extends the Better Auth user model and owns the application-domain tables:

| MarketMint concept | Responsibility |
|---|---|
| `user.role` | Application-level role: `user` or `admin`. |
| `user.banned` / `banReason` / `banExpires` | User blocking state, handled through Better Auth admin capabilities. |
| `user_favorite_cryptos` | User-specific bookmarked crypto assets. |
| `audit_logs` | Application audit trail for authentication and administrator events. |
| `crypto_assets` | Local synchronized crypto market catalog. |
| `crypto_asset_snapshots` | Append-only per-asset market history. |
| `crypto_market_kpis` | Append-only market KPI history. |
| `crypto_sync_runs` | Operational log of synchronization attempts. |

## Authentication Methods

### Email and Password

Better Auth handles email/password registration and login. Credential storage and password hashing are delegated to Better Auth.

### Google OAuth

Google login is configured through Better Auth's social provider support. Google account linkage is stored in Better Auth's account model, and MarketMint owns the resulting application session.

### Logout

Logout revokes the current Better Auth session and clears the browser session state.

### Password Reset

Password reset is handled through Better Auth and the configured transactional email provider.

### Email Verification

Email verification is handled through Better Auth and transactional email. The email delivery provider is configured through environment variables.

## Session Strategy

MarketMint uses **cookie-based sessions** for the browser application.

### Why Cookies Instead of Local Storage

- HTTP-only cookies cannot be read by browser JavaScript, reducing exposure if an XSS vulnerability exists.
- Cookies work normally in regular and private/incognito browser sessions.
- Better Auth manages session creation, expiry, validation, and rotation.
- The frontend does not need to manually store or manage bearer tokens.

Bearer token authentication can be added later for non-browser clients such as mobile apps, CLIs, or partner integrations.

## Authorization Model

MarketMint uses role-based access control.

| Role | Meaning |
|---|---|
| `user` | Default role. Can access the private dashboard and personal crypto preferences. |
| `admin` | Can access administrator user-management capabilities and protected admin routes. |

Admin-only routes are enforced in the backend. The frontend can hide admin screens from non-admin users, but backend authorization remains the source of truth.

## Ban State and Deletion

User blocking is represented with Better Auth's ban fields:

| Field | Meaning |
|---|---|
| `banned` | Indicates whether the user is blocked from accessing protected application routes. |
| `banReason` | Optional explanation for the ban. |
| `banExpires` | Optional expiration timestamp; `null` represents a permanent ban. |

Banned users are rejected by protected-route middleware with `403` responses.

The administrator flow also supports user deletion through Better Auth's admin endpoint. Banning is useful when the user record should remain available for traceability, while deletion is available when an administrator intentionally removes the user.

## User Management

User management is handled through Better Auth's Admin plugin mounted under `/api/auth/admin/*`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/admin/list-users` | POST | List users with filtering and pagination. |
| `/api/auth/admin/get-user` | POST | Get a single user. |
| `/api/auth/admin/create-user` | POST | Create a user. |
| `/api/auth/admin/update-user` | POST | Update basic user fields such as name and role. |
| `/api/auth/admin/ban-user` | POST | Ban a user. |
| `/api/auth/admin/unban-user` | POST | Unban a user. |
| `/api/auth/admin/remove-user` | POST | Permanently delete a user. |
| `/api/auth/admin/set-user-password` | POST | Set a user's password. |
| `/api/auth/admin/list-user-sessions` | POST | List a user's active sessions. |
| `/api/auth/admin/revoke-user-session(s)` | POST | Revoke one or all user sessions. |

Access to admin endpoints is restricted to administrators.

## Protected Routes Middleware

The backend includes a custom authorization middleware, exposed as `requireRole(role?)`.

This middleware:

1. Validates the active Better Auth session.
2. Rejects unauthenticated requests.
3. Rejects banned users.
4. Checks a required role when the route defines one.

This allows regular private routes and admin-only routes to share a consistent session and authorization mechanism.

## First Admin Bootstrap

MarketMint includes an environment-based first admin bootstrap flow.

On application startup, the backend checks whether an administrator already exists. If no admin exists and the required bootstrap variables are configured, the application creates the first administrator account automatically.

| Variable | Purpose |
|---|---|
| `FIRST_ADMIN_EMAIL` | Email for the first admin account. |
| `FIRST_ADMIN_PASSWORD` | Password for the first admin account. |
| `FIRST_ADMIN_NAME` | Optional display name; defaults to `Admin` if omitted. |

The bootstrap check is idempotent. Once an admin exists, startup does not create another admin. After the first administrator is created, the bootstrap variables can be removed from the runtime environment.

## Auth Endpoints

Better Auth is mounted under `/api/auth/*`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/sign-up/email` | POST | Register with email/password. |
| `/api/auth/sign-in/email` | POST | Login with email/password. |
| `/api/auth/sign-in/social` | POST | Login with Google. |
| `/api/auth/sign-out` | POST | Logout and revoke the current session. |
| `/api/auth/get-session` | GET | Validate the current session and return user information. |
| `/api/auth/forget-password` | POST | Request a password reset email. |
| `/api/auth/reset-password` | POST | Set a new password using a reset token. |

## Audit Logs

MarketMint records security and business-relevant events in `audit_logs`.

| Event | Trigger |
|---|---|
| `AUTH_REGISTER_SUCCESS` | Successful registration. |
| `AUTH_LOGIN_SUCCESS` | Successful email/password login. |
| `AUTH_LOGIN_FAILED` | Failed login attempt. |
| `AUTH_GOOGLE_LOGIN_SUCCESS` | Successful Google login. |
| `AUTH_LOGOUT` | User logout. |
| `USER_CREATED` | Administrator creates a user. |
| `USER_UPDATED` | Administrator or user updates basic information. |
| `USER_ROLE_UPDATED` | Administrator changes a user's role. |
| `USER_BANNED` | Administrator bans a user. |
| `USER_UNBANNED` | Administrator unbans a user. |

Audit log rows can reference both the actor user and the target user using the Better Auth `user.id` as the canonical identifier.

## Secret Handling

Production secrets are not committed to the repository.

Secrets are handled through:

- GitHub repository secrets for CI/CD-only values.
- Google Cloud Secret Manager for runtime secrets used by Cloud Run.
- `.env.example` files for local documentation and onboarding.

Sensitive values include database credentials, Better Auth secrets, Google OAuth secrets, Resend API keys, and CoinGecko API keys.

## Additional Security Practices

- The frontend does not call CoinGecko directly.
- API access to private data requires a valid session.
- Admin routes require administrator role checks.
- Better Auth owns password hashing and session lifecycle behavior.
- HTTP-only cookies are used instead of browser-managed local token storage.
- Request validation is handled in the backend for supported API routes.
- Secrets are documented with examples but never committed as real values.
