import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/** Convert PostgreSQL-style $1, $2 placeholders to SQLite ? placeholders */
function toSqlitePlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\$(\d+)/g, () => (i++, '?'));
}

export type DbRow = Record<string, unknown>;

export interface DbAdapter {
  get(sql: string, params?: unknown[]): Promise<DbRow | undefined>;
  all(sql: string, params?: unknown[]): Promise<DbRow[]>;
  run(sql: string, params?: unknown[]): Promise<{ lastID?: number; changes?: number }>;
  exec(sql: string): Promise<void>;
}

function createPgAdapter(): DbAdapter {
  const { Pool } = require('pg') as typeof import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: /railway|rlwy\.net/.test(process.env.DATABASE_URL ?? '') ? { rejectUnauthorized: false } : undefined,
  });

  return {
    async get(sql: string, params: unknown[] = []): Promise<DbRow | undefined> {
      const r = await pool.query(sql, params);
      return (r.rows[0] as DbRow) ?? undefined;
    },
    async all(sql: string, params: unknown[] = []): Promise<DbRow[]> {
      const r = await pool.query(sql, params);
      return (r.rows as DbRow[]) ?? [];
    },
    async run(sql: string, params: unknown[] = []): Promise<{ lastID?: number; changes?: number }> {
      const r = await pool.query(sql, params);
      return { changes: r.rowCount ?? 0 };
    },
    async exec(sql: string): Promise<void> {
      await pool.query(sql);
    },
  };
}

function createSqliteAdapter(): DbAdapter {
  const Database = require('better-sqlite3');
  const dbPath =
    process.env.DATABASE_PATH ?? path.join(__dirname, '../../data/grantflow.db');
  const db = new Database(dbPath);

  return {
    get(sql: string, params: unknown[] = []): Promise<DbRow | undefined> {
      const s = toSqlitePlaceholders(sql);
      const row = db.prepare(s).get(...params) as DbRow | undefined;
      return Promise.resolve(row);
    },
    all(sql: string, params: unknown[] = []): Promise<DbRow[]> {
      const s = toSqlitePlaceholders(sql);
      const rows = db.prepare(s).all(...params) as DbRow[];
      return Promise.resolve(rows);
    },
    run(sql: string, params: unknown[] = []): Promise<{ lastID?: number; changes?: number }> {
      const s = toSqlitePlaceholders(sql);
      const r = db.prepare(s).run(...params);
      return Promise.resolve({ lastID: r.lastInsertRowid as number, changes: r.changes });
    },
    exec(sql: string): Promise<void> {
      db.exec(sql);
      return Promise.resolve();
    },
  };
}

const adapter: DbAdapter = process.env.DATABASE_URL
  ? createPgAdapter()
  : createSqliteAdapter();

/** Async database interface. Use db.get(), db.all(), db.run() with $1, $2 placeholders. */
export const db = adapter;

const schemaFile = process.env.DATABASE_URL ? 'schema.pg.sql' : 'schema.sql';

export async function ensureSchema(): Promise<void> {
  const schemaPath = path.join(__dirname, schemaFile);
  const schema = readFileSync(schemaPath, 'utf-8');
  // PostgreSQL doesn't support multiple statements in one query by default; split by semicolon for PG
  if (process.env.DATABASE_URL) {
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));
    for (const stmt of statements) {
      if (stmt) await adapter.exec(stmt + ';');
    }
  } else {
    await adapter.exec(schema);
  }
}
