PR: Finalize demo login flow, CSRF/cookie fixes, and smoke tests

Summary
- Force demo store when DATABASE_URL is not set (local dev).
- Respect `VITE_API_URL` in client API resolver.
- Mount demo auth endpoints at both `/auth` and `/api/auth` to be compatible with client and demo server.
- Ensure CSRF middleware accepts `/auth/csrf` and `/api/auth/csrf`.
- Add a cookie-aware smoke test `scripts/smoke-demo-cookies.mjs`.
- Harden demo cookie attributes for local development.

Testing
- `npm run dev` → server should run in demo fallback and client picks correct API URL.
- `node scripts/smoke-demo-cookies.mjs` → validates CSRF, login, appointment creation, conflict check.

Notes
- Prisma DB startup is attempted in production; local dev uses demo store when `DATABASE_URL` is absent.
- I could not push the branch from this environment; run `git push -u origin feat/finalize-demo-login` locally to push and open a PR with `gh pr create`.
