Developer notes — demo mode and local setup

Overview
- This branch finalizes a reliable "demo" mode so developers can run the app locally without a MySQL/Prisma database.
- When `DATABASE_URL` is not set, the server will default to an embedded JSON demo server.

Local run
1. Install dependencies: `npm install`
2. Start dev servers (concurrently): `npm run dev`
3. Client env override (optional): set `client/.env.local` with `VITE_API_URL="http://localhost:5000"` (or the demo port printed by server).

Smoke tests
- Basic smoke test: `node scripts/smoke-demo.mjs`
- Cookie-aware smoke test: `node scripts/smoke-demo-cookies.mjs`

Auth details (demo accounts)
- `admin@lfcfirm.com` / `Password123!` (admin)
- `staff@lfcfirm.com` / `Password123!` (staff)
- `attorney.rivera@lfcfirm.com` / `Password123!` (attorney)
- `client@demo.com` / `Password123!` (client)

Notes for PR
- PR body is in `PR_BODY.md`.
- Merge checklist: `MERGE_CHECKLIST.md`.

If CI or staging requires DB-backed tests, configure a MySQL server and set `DATABASE_URL` before running migrations: `npm run prisma:migrate` and `npm run seed` (server workspace).
