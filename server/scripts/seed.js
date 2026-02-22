import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '../src/db/schema.sql');
const dbPath = path.join(__dirname, '../data/grantflow.db');

const db = new Database(dbPath);
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

const grantIds = [
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
];

const insertGrant = db.prepare(`
  INSERT OR REPLACE INTO grants (id, title, description, funder, amount_min, amount_max, deadline, source)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insertGrant.run(
  grantIds[0],
  'Community Impact Fund',
  'Funding for CICs and community organisations delivering local impact. Supports projects that improve wellbeing, employment, or environment in underserved areas.',
  'National Community Fund',
  5000,
  50000,
  '2025-06-30',
  'seed'
);
insertGrant.run(
  grantIds[1],
  'Green Transition Grant',
  'Grants for organisations moving to net zero: energy efficiency, transport, waste reduction. Must have a clear carbon reduction plan.',
  'Climate Action Trust',
  10000,
  100000,
  '2025-09-15',
  'seed'
);
insertGrant.run(
  grantIds[2],
  'Youth Skills and Employment',
  'Support for programmes that help young people into work or training. Priority for 16–24 year olds and disadvantaged groups.',
  'Youth Futures Foundation',
  20000,
  200000,
  '2025-12-01',
  'seed'
);

db.close();
console.log('Seed data inserted: 3 sample grants.');
