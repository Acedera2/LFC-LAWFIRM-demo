#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates database and runs migrations
 */

import mysql from "mysql2/promise";
import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config();

const execAsync = promisify(exec);

function parseDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for setup-db.js");
  }

  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== "mysql:") {
    throw new Error(`Unsupported database protocol: ${parsed.protocol}`);
  }

  return {
    host: parsed.hostname || "localhost",
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username || "root"),
    password: decodeURIComponent(parsed.password || ""),
    database: parsed.pathname.replace(/^\//, "") || "legal_field_consultancy"
  };
}

const DB_CONFIG = parseDatabaseUrl(process.env.DATABASE_URL);

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    port: DB_CONFIG.port
  });

  try {
    console.log(`📦 Creating database: ${DB_CONFIG.database}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    console.log(`✅ Database created successfully`);
  } catch (error) {
    console.error(`❌ Failed to create database:`, error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

async function runMigrations() {
  try {
    console.log(`\n📂 Running Prisma migrations...`);
    await execAsync("npx prisma migrate deploy", { cwd: process.cwd() });
    console.log(`✅ Migrations completed successfully`);
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log(`\n🌱 Seeding database with initial data...`);
    await execAsync("node prisma/seed.js", { cwd: process.cwd() });
    console.log(`✅ Database seeded successfully`);
  } catch (error) {
    console.error(`❌ Seeding failed:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting database setup...\n");
  
  try {
    await createDatabase();
    await runMigrations();
    await seedDatabase();
    
    console.log(`\n✨ Database setup completed successfully!`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Start the server: npm run dev`);
    console.log(`   2. Start the client: cd ../client && npm run dev`);
    console.log(`   3. Open http://localhost:5173 in your browser\n`);
  } catch (error) {
    console.error(`\n❌ Setup failed:`, error);
    process.exit(1);
  }
}

main();
