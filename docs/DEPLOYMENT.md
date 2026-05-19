# Deployment Guide

## GitHub

```bash
git init
git add .
git commit -m "Initial enterprise legal scheduling platform"
git branch -M main
git remote add origin <your-github-url>
git push -u origin main
```

Do not commit `.env` files, uploaded documents, local caches, or build folders.

## Database

Use a MySQL-compatible provider with foreign key support.

1. Create a database.
2. Copy the connection string.
3. Set `DATABASE_URL` in the backend environment.
4. Run:

```bash
npm run prisma:deploy --workspace server
npm run seed --workspace server
```

## Backend on Render or Railway

Service settings:

- Root directory: `server`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `npm run start`
- Node version: `20`

Environment variables:

```text
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-vercel-domain.vercel.app
DATABASE_URL=mysql://...
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<different-long-random-secret>
REFRESH_TOKEN_EXPIRES_IN_DAYS=7
COOKIE_SECURE=true
COOKIE_SAMESITE=none
UPLOAD_DIR=uploads
```

For production documents, replace local upload storage with private object storage.

## Frontend on Vercel

Project settings:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Environment variables:

```text
VITE_API_URL=https://your-api-host.com/api
VITE_APP_NAME=LFC Legal Appointment System
```

## Production Checklist

- Confirm backend `CLIENT_URL` matches the deployed Vercel URL.
- Use HTTPS for frontend and backend.
- Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` for cross-domain production hosting.
- Run `npm run lint`, `npm run build --workspace client`, and `npx prisma validate --schema server/prisma/schema.prisma`.
- Seed initial roles and demo accounts only in non-production or controlled demo environments.
