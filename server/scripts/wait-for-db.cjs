#!/usr/bin/env node
const net = require('net');
const url = require('url');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('No DATABASE_URL found in environment; skipping wait-for-db.');
  process.exit(0);
}

function parseHostPort(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    return { host: parsed.hostname, port: Number(parsed.port || 3306) };
  } catch (e) {
    return null;
  }
}

const addr = parseHostPort(DATABASE_URL);
if (!addr) {
  console.error('Unable to parse DATABASE_URL; ensure it is a valid URL.');
  process.exit(1);
}

const timeoutMs = Number(process.env.WAIT_FOR_DB_TIMEOUT_MS || 30000);
const start = Date.now();

function tryConnect() {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: addr.host, port: addr.port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

(async function waitLoop() {
  while (Date.now() - start < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await tryConnect();
    if (ok) {
      console.log(`Database reachable at ${addr.host}:${addr.port}`);
      process.exit(0);
    }
    // wait 1s then retry
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.error(`Timed out waiting for DB at ${addr.host}:${addr.port} after ${timeoutMs}ms.`);
  console.error('Start your database (docker-compose up -d) or adjust DATABASE_URL and try again.');
  process.exit(2);
})();
