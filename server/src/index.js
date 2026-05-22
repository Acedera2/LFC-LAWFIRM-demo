import { app } from "./app.js";
import { env } from "./config/env.js";

async function startWithPrisma() {
  try {
    const { prisma } = await import("./config/prisma.js");
    // try connecting to the DB
    await prisma.$connect();
    const server = app.listen(env.port, () => {
      console.log(`LFC Legal Appointment System API (Prisma) listening on port ${env.port}`);
    });

    async function shutdown(signal) {
      console.log(`${signal} received. Closing server.`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    return true;
  } catch (err) {
    console.warn('Prisma or database unavailable, falling back to demo server:', err && err.message ? err.message : err);
    return false;
  }
}

async function start() {
  // Honor explicit environment toggle to force demo store
  // If there's no DATABASE_URL configured, default to demo store for local dev
  if (!env.databaseUrl) {
    env.useDemoStore = true;
  }

  if (env.useDemoStore) {
    console.log('USE_DEMO_STORE=true, starting demo store without attempting Prisma.');
    try {
      await import("../dev-server.js");
      console.log('Started demo server (forced).');
      return;
    } catch (e) {
      console.error('Failed to start demo server fallback (forced):', e);
      process.exit(1);
    }
  }

  const ok = await startWithPrisma();
  if (!ok) {
    // fallback to the lightweight JSON demo server
    try {
      // prefer the demo server script which starts its own express app
      await import("../dev-server.js");
      console.log('Started demo server fallback.');
    } catch (e) {
      console.error('Failed to start demo server fallback:', e);
      process.exit(1);
    }
  }
}

start();
