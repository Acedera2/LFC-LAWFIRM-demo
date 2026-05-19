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

## Production Notes

- Do not commit `.env` files.
- Use a managed MySQL-compatible database such as PlanetScale, Railway MySQL, or Amazon RDS.
- Set `CLIENT_URL` to your deployed Vercel URL.
- Keep `JWT_SECRET` long, random, and rotated outside source control.
- Use a different strong `REFRESH_TOKEN_SECRET`.
- File uploads are stored locally by default; for production, wire `UPLOAD_DIR` to persistent storage or swap the document service to S3-compatible storage.
