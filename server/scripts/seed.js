/**
 * Seed sample grants.
 * - With DATABASE_URL set: uses PostgreSQL (ON CONFLICT DO UPDATE).
 * - Otherwise: uses SQLite (INSERT OR REPLACE).
 */
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env.local from project root (parent of server/)
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

import { readFileSync } from 'fs';

const grants = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Community Impact Fund',
    description:
      'Funding for CICs and community organisations delivering local impact. Supports projects that improve wellbeing, employment, or environment in underserved areas.',
    funder: 'National Community Fund',
    amount_min: 5000,
    amount_max: 50000,
    deadline: '2025-06-30',
    source: 'seed',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Green Transition Grant',
    description:
      'Grants for organisations moving to net zero: energy efficiency, transport, waste reduction. Must have a clear carbon reduction plan.',
    funder: 'Climate Action Trust',
    amount_min: 10000,
    amount_max: 100000,
    deadline: '2025-09-15',
    source: 'seed',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Youth Skills and Employment',
    description:
      'Support for programmes that help young people into work or training. Priority for 16–24 year olds and disadvantaged groups.',
    funder: 'Youth Futures Foundation',
    amount_min: 20000,
    amount_max: 200000,
    deadline: '2025-12-01',
    source: 'seed',
  },
];

async function seedPg() {
  const { default: pg } = await import('pg');
  const rawUrl = process.env.DATABASE_URL ?? '';
  const useSsl = /railway|rlwy\.net/.test(rawUrl);
  const connectionString = rawUrl.replace(/\?sslmode=[^&]+&?/, '?').replace(/\?$/, '') || rawUrl;
  const pool = new pg.Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });
  const sql = `
    INSERT INTO grants (id, title, description, funder, amount_min, amount_max, deadline, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title, description = EXCLUDED.description, funder = EXCLUDED.funder,
      amount_min = EXCLUDED.amount_min, amount_max = EXCLUDED.amount_max,
      deadline = EXCLUDED.deadline, source = EXCLUDED.source, updated_at = CURRENT_TIMESTAMP
  `;
  for (const g of grants) {
    await pool.query(sql, [
      g.id,
      g.title,
      g.description,
      g.funder,
      g.amount_min,
      g.amount_max,
      g.deadline,
      g.source,
    ]);
  }
  await pool.end();
  console.log('PostgreSQL: seed data inserted (3 sample grants).');
}

async function seedSqlite() {
  const { default: Database } = await import('better-sqlite3');
  const schemaPath = path.join(__dirname, '../src/db/schema.sql');
  const dbPath = path.join(__dirname, '../data/grantflow.db');
  const db = new Database(dbPath);
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO grants (id, title, description, funder, amount_min, amount_max, deadline, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const g of grants) {
    stmt.run(g.id, g.title, g.description, g.funder, g.amount_min, g.amount_max, g.deadline, g.source);
  }
  db.close();
  console.log('SQLite: seed data inserted (3 sample grants).');
}

async function main() {
  if (process.env.DATABASE_URL) {
    await seedPg();
  } else {
    await seedSqlite();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
