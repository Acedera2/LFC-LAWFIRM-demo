# LFC Legal Appointment System

A full-stack, deployment-ready legal scheduling SaaS for law firms and field consultancy teams. It includes a polished public website, secure role-based dashboards, appointment inquiry workflows, lawyer availability, rule-based conflict monitoring, workload analytics, audit/activity logs, secure document upload support, and seed data for realistic demos.

The system follows the research scope for a **Priority-Based Appointment Scheduling and Conflict Monitoring System with Web-Based Inquiry for LFC Legal Appointment System**. It does not include AI automation, machine learning, payment gateways, court case management, video conferencing, mobile app features, or external government integrations.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Recharts
- Backend: Node.js, Express.js, Prisma ORM, MySQL
- Security: JWT access and refresh cookies, bcrypt password hashing, CSRF protection, role-based access control, validation, rate limiting, secure headers
- Deployment: Vercel-ready client, Render/Railway-ready API, PlanetScale/MySQL-ready database

## Repository Structure

```text
client/      React + Vite frontend
server/      Express + Prisma API
database/    SQL schema and database notes
docs/        API, security, and deployment documentation
```

Client feature modules are organized under `client/src/features/`:

- `appointments/` shared appointment API adapters and mappers
- `clients/` client profile mapper utilities

The dashboard now includes a dedicated clients workspace route (`/clients`) for staff/admin timeline drill-down.

Optional Supabase frontend mode:

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable Supabase Auth + realtime notifications.
- If these variables are empty, the app automatically falls back to existing Express API auth and notifications.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment files:

   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

3. Configure `server/.env` with your MySQL `DATABASE_URL` and a strong `JWT_SECRET`.

4. Prepare the database:

   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

5. Run the full app:

   ```bash
   cd ..
   npm run dev
   ```

Frontend: `http://127.0.0.1:5173`  
Backend: `http://localhost:5000/api`

## Prototype Scope

This workspace has been trimmed to a smaller prototype focused on core scheduling features. The prototype includes:
- Landing page (Home, About, Services, Contact, Lawyers)
- Role-based authentication (Client, Staff, Lawyer, Admin)
- Appointment requests with priority (`URGENT`, `MODERATE`, `REGULAR`)
- Lawyer availability blocks (`lawyer_availability`)
- Conflict detection and simple alternative suggestions
- Simple in-system notifications (no external email/SMS)
- Centralized calendar and dashboard monitors

Removed advanced features for the prototype: analytics snapshots, ML/predictive tables, file uploads, external integrations, and complex automation.

---

## Prototype Feature Alignment

The project has been aligned to the exact prototype specification you provided. Below is a concise mapping of required features (kept) and explicitly removed items.

1. Landing Page
   - Kept: Home Page, About, Services, Contact, Lawyer Information, Login button
   - Removed: Complex animations, advanced chatbot, AI recommendations

2. User Authentication
   - Kept: Login system, Role-based access (Client, Staff, Lawyer, Admin), Logout
   - Removed: Multi-factor authentication, Social login, Advanced session analytics

3. Client Appointment Module
   - Kept: Appointment request form, Date-first booking flow, Preferred lawyer selection, Priority classification (Urgent, Moderate, Regular), View appointment status, Request cancellation
   - Removed: File/document upload, Video consultation, Online payment, AI appointment recommendation

4. Lawyer Availability Monitoring
   - Kept: Available/unavailable status, Daily schedule viewing, Assigned appointment viewing
   - Removed: Automated workload balancing, Predictive availability

5. Appointment Management
   - Kept: Approve, Reject, Reschedule, Cancel, Appointment list table
   - Removed: Complex workflow automation, Multi-branch management

6. Conflict Detection
   - Kept: Detect overlapping schedules, Prevent double booking, Alert admin/staff on conflict
   - Removed: AI conflict prediction, Historical forecasting engine

7. Notification System
   - Kept: In-system notifications for appointment confirmations, updates, cancellations
   - Removed: SMS, email automation, push notifications

8. Centralized Calendar
   - Kept: View all appointments (pending, approved, cancelled), Lawyer availability
   - Removed: Google Calendar sync, external integrations

9. Admin Dashboard
   - Kept: Total appointments, Pending requests, Approved requests, Conflict count, User management
   - Removed: Advanced analytics, predictive reports, real-time monitoring graphs

10. Staff Dashboard
    - Kept: Appointment monitoring, Client records, Lawyer availability, Conflict alerts

11. Lawyer Dashboard
    - Kept: Assigned appointments, Schedule viewing, Availability management

12. Database Features
    - Required tables kept: `users`, `clients`, `lawyers`, `appointments`, `notifications`, `lawyer_availability`, `cancellation_requests`
    - Removed tables: `analytics_reports`, `predictive_logs`, machine-learning tables

13. Reports
    - Kept: Appointment report, Lawyer schedule report
    - Removed: Advanced analytics, predictive analytics, heatmaps, trend forecasting

### Recommended Prototype Scope Summary
This repository demonstrates the minimal prototype requested: Appointment Scheduling, Lawyer Availability, Priority Classification, Conflict Detection, Centralized Monitoring, and Role-Based Access.

If you'd like, I can now:
- Commit these documentation changes to a branch and open a PR.
- Add a short integration test or smoke script that exercises the core flows (request appointment → conflict-check → schedule) against either the demo store or a real DB.

## GitHub Deployment

GitHub is the source repository for this app. For hosting, use the client on Vercel and the API on Render or Railway.

1. Create a GitHub repository and push the monorepo.
2. Set `client/.env` and `server/.env` in your local environment only; do not commit secrets.
3. Deploy the `server/` folder to Render or Railway with `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, and `CLIENT_URL` set.
4. Deploy the `client/` folder to Vercel with `VITE_API_URL` pointing to the public API URL.
5. Confirm the deployed frontend can reach `/api/auth/csrf`, `/api/auth/login`, and `/api/auth/me` over HTTPS.

If you want a single GitHub-driven workflow, add GitHub Actions to build the client and validate the server on every push, then deploy to Vercel/Render from those providers.

## Seed Accounts

All seeded users use the password:

```text
Password123!
```

- Admin: `admin@lfcfirm.com`
- Staff: `staff@lfcfirm.com`
- Lawyer: `attorney.rivera@lfcfirm.com`
- Client: `client@demo.com`

## Documentation

- [API Documentation](docs/API.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Notes](docs/SECURITY.md)
- [SQL Schema](database/schema.sql)
- [Supabase Setup Guide](docs/SUPABASE_SETUP.md)

## Architecture & Process

See the detailed system process and architecture notes for the Priority-Based Appointment Scheduling and Conflict Monitoring System in the documentation:

- [Architecture & Process](docs/ARCHITECTURE_AND_PROCESS.md)

## Developer utilities

To capture role-specific dashboard screenshots locally, you can use Playwright or Puppeteer. Example (Playwright):

1. Install Playwright in the repo root:

```bash
npm i -D playwright
npx playwright install
```

2. Create a small script to sign in and capture screenshots, or run Playwright's test runner to take screenshots of `/admin`, `/staff`, `/lawyer`, and `/client`.

I captured screenshots during the dev session; if you want I can add a commit with automated capture scripts and the saved images (`docs/assets/`) — tell me if you'd like that and I'll create the capture script and write the images into `docs/assets/`.

## Production Notes

- Do not commit `.env` files.
- Use a managed MySQL-compatible database such as PlanetScale, Railway MySQL, or Amazon RDS.
- Set `CLIENT_URL` to your deployed Vercel URL.
- Keep `JWT_SECRET` long, random, and rotated outside source control.
- Use a different strong `REFRESH_TOKEN_SECRET`.
- File uploads are stored locally by default; for production, wire `UPLOAD_DIR` to persistent storage or swap the document service to S3-compatible storage.

## Windows development notes: Prisma file-lock (OneDrive) issue

If you are developing on Windows and `prisma generate` fails with an EPERM/rename error (for example when trying to rename `query_engine-windows.dll.node.tmp*` to `query_engine-windows.dll.node`), the most common cause is a file-lock from OneDrive or an antivirus product. The error looks like:

```
Error: EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp' -> '...query_engine-windows.dll.node'
```

Recommended workarounds:

- Pause or exit OneDrive for the project folder while running `npm run prisma:generate` (OneDrive often locks new/temporary files).
- Exclude the repository folder from your antivirus/real-time scanning while running Prisma CLI steps.
- Run the Prisma generation in an elevated Administrator shell.
- Move the repository out of a synced folder (OneDrive/Google Drive) to a plain local path (e.g., `C:\dev\projects`) and reinstall node modules there.

Tooling in this repo to help:

- `server/scripts/prisma-generate-safe.cjs` — tries to remove temporary Prisma files and will attempt a safe `prisma generate` with retries; it prints hints when it fails.
- `server/scripts/wait-for-db.cjs` — used before migrations and seed to wait for the DB TCP port to be reachable; this avoids immediate `P1001` migration failures when the DB hasn't been started yet.

Quick local dev checklist (Windows):

1. Move the repo outside OneDrive (recommended): `C:\dev\lfc-demo`.
2. Open an elevated PowerShell (Run as Administrator).
3. Install dependencies: `npm ci`.
4. Start local DB (Docker): `docker-compose up -d` (or start your MySQL server).
5. Run safe generation: `cd server && npm run prisma:generate:safe`.
6. Run migrations & seed: `npm run prisma:migrate && npm run seed`.

If you still see `prisma generate` fail after retries, pause OneDrive and re-run the safe script, or run `npm run prisma:generate` manually in the elevated shell to inspect CLI output. Moving the repo out of a synced folder is the most reliable long-term fix.

Demo mode and client API URL
---------------------------------
When running in demo fallback (no MySQL), the demo server starts on the first available port starting at 5000 (5000, 5001, ...). The client needs to point to the demo server API URL when running separately. For quick local runs set `client/.env.local`:

```
VITE_API_URL="http://localhost:5004"
```

Adjust the port if your demo server uses a different one (check the terminal output when you run `npm run dev`). Alternatively, run both client and server under the same host/origin and configure a proxy so the client can use a relative `/api` path.

Testing login (demo mode)
---------------------------------
- Start dev servers: `npm run dev` (server will auto-fallback to demo if DB unavailable).
- Open the app and use the Login page Demo accounts buttons (password: `Password123!`).
- Or test via curl/PowerShell against `http://localhost:5004/auth/login` (adjust port as necessary).

Smoke test command
---------------------------------
- Run the demo smoke test script: `npm run smoke:demo`
- The script searches ports `5000-5010`, logs in with the admin demo account, creates an appointment, and runs a conflict check.
