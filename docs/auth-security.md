# Authentication & Security

## Status

Authentication and authorization have **not been implemented** yet. This document records the requirements and security principles that will guide the implementation.

## Authentication requirements

- Email / password sign-up and sign-in.
- Google OAuth sign-in.
- Secure sign-out (token invalidation).
- Private routes: unauthenticated users must be redirected to the login page.
- User management: view profile, update display name / avatar.

## Security principles

| Area | Requirement |
|---|---|
| Sessions | Short-lived tokens; refresh token rotation. |
| CORS | `WEB_ORIGIN` env var restricts allowed origins. |
| Secrets | Never committed to version control. Use `.env` locally and Cloud Run secrets in production. |
| Environment variables | All sensitive values are injected at runtime; `.env.example` lists the keys without real values. |
| Access control | Role / permission model to be defined; at minimum, authenticated vs. unauthenticated. |
| Password storage | Passwords must be hashed (bcrypt or provider-managed). |
| HTTPS | Enforced in all non-local environments. |

## Next steps

- Choose auth strategy (JWT + refresh tokens, sessions, or Firebase Auth / Supabase Auth).
- Implement sign-up, sign-in, and sign-out endpoints in `apps/api`.
- Add auth middleware and protected route guards.
- Implement frontend auth context and private route wrapper.
- Document session lifecycle and token refresh flow.
