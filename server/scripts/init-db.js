/**
 * Initialize database schema.
 * - With DATABASE_URL set: runs PostgreSQL schema (e.g. Railway).
 * - Otherwise: creates SQLite DB and runs SQLite schema (local dev).
 */
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { readFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initPg() {
  const { default: pg } = await import('pg');
  const schemaPath = path.join(__dirname, '../src/db/schema.pg.sql');
  let schema = readFileSync(schemaPath, 'utf-8');
  // Remove comment lines so first statement (e.g. CREATE TABLE users) is not dropped
  schema = schema.split('\n').filter((line) => !line.trim().startsWith('--')).join('\n');
  const rawUrl = process.env.DATABASE_URL ?? '';
  const useSsl = /railway|rlwy\.net/.test(rawUrl);
  const connectionString = rawUrl.replace(/\?sslmode=[^&]+&?/, '?').replace(/\?$/, '') || rawUrl;
  const pool = new pg.Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    if (stmt) await pool.query(stmt + ';');
  }
  await pool.end();
  console.log('PostgreSQL schema applied (DATABASE_URL).');
}

async function initSqlite() {
  const { default: Database } = await import('better-sqlite3');
  const schemaPath = path.join(__dirname, '../src/db/schema.sql');
  const dbPath = path.join(__dirname, '../data/grantflow.db');
  mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  db.close();
  console.log('SQLite database initialized at', dbPath);
}

async function main() {
  if (process.env.DATABASE_URL) {
    await initPg();
  } else {
    await initSqlite();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
