/**
 * Seed all tables with sample data.
 * - With DATABASE_URL set: uses PostgreSQL (ON CONFLICT DO UPDATE).
 * - Otherwise: uses SQLite (INSERT OR REPLACE).
 *
 * Seed users: demo@example.com / password, admin@example.com / password
 */
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

import { readFileSync, mkdirSync } from 'fs';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Fixed IDs for idempotent seed
const USER_IDS = {
  demo: 'a0000001-0000-4000-8000-000000000001',
  admin: 'a0000002-0000-4000-8000-000000000002',
};
const ORG_IDS = {
  community: 'b0000001-0000-4000-8000-000000000001',
  green: 'b0000002-0000-4000-8000-000000000002',
};
const GRANT_IDS = {
  g1: '550e8400-e29b-41d4-a716-446655440001',
  g2: '550e8400-e29b-41d4-a716-446655440002',
  g3: '550e8400-e29b-41d4-a716-446655440003',
};

const grants = [
  {
    id: GRANT_IDS.g1,
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
    id: GRANT_IDS.g2,
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
    id: GRANT_IDS.g3,
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

const passwordHash = hashPassword('password');

const users = [
  { id: USER_IDS.demo, email: 'demo@example.com', name: 'Demo User', role: 'user' },
  { id: USER_IDS.admin, email: 'admin@example.com', name: 'Admin User', role: 'admin' },
];

const organizations = [
  {
    id: ORG_IDS.community,
    name: 'Community CIC',
    mission: 'Supporting local people and places through inclusive projects.',
    sector: 'Community',
    location: 'London, UK',
  },
  {
    id: ORG_IDS.green,
    name: 'Green Futures CIC',
    mission: 'Accelerating the transition to a low-carbon economy in our region.',
    sector: 'Environment',
    location: 'Manchester, UK',
  },
];

const userOrganizations = [
  { user_id: USER_IDS.demo, organization_id: ORG_IDS.community, role: 'member' },
  { user_id: USER_IDS.demo, organization_id: ORG_IDS.green, role: 'member' },
  { user_id: USER_IDS.admin, organization_id: ORG_IDS.community, role: 'admin' },
];

const organizationFinancials = [
  { id: 'c0000001-0000-4000-8000-000000000001', organization_id: ORG_IDS.community, annual_turnover: 120000, year_end: '2024-03-31' },
  { id: 'c0000002-0000-4000-8000-000000000002', organization_id: ORG_IDS.green, annual_turnover: 85000, year_end: '2024-06-30' },
];

const impactMetrics = [
  { id: 'd0000001-0000-4000-8000-000000000001', organization_id: ORG_IDS.community, name: 'People supported', value: '450', period: '2023-24' },
  { id: 'd0000002-0000-4000-8000-000000000002', organization_id: ORG_IDS.community, name: 'Volunteer hours', value: '1200', period: '2023-24' },
  { id: 'd0000003-0000-4000-8000-000000000003', organization_id: ORG_IDS.green, name: 'CO2 saved (tonnes)', value: '12', period: '2023-24' },
];

const programmes = [
  { id: 'e0000001-0000-4000-8000-000000000001', organization_id: ORG_IDS.community, name: 'Community Kitchen', description: 'Weekly meals and skills sessions for residents.' },
  { id: 'e0000002-0000-4000-8000-000000000002', organization_id: ORG_IDS.community, name: 'Job Club', description: 'CV and interview support for job seekers.' },
  { id: 'e0000003-0000-4000-8000-000000000003', organization_id: ORG_IDS.green, name: 'Bike Library', description: 'Free bike hire and repair workshops.' },
];

const applicationIds = {
  app1: 'f0000001-0000-4000-8000-000000000001',
  app2: 'f0000002-0000-4000-8000-000000000002',
  app3: 'f0000003-0000-4000-8000-000000000003',
};

const applications = [
  { id: applicationIds.app1, organization_id: ORG_IDS.community, grant_id: GRANT_IDS.g1, status: 'draft', deadline: '2025-06-30' },
  { id: applicationIds.app2, organization_id: ORG_IDS.community, grant_id: GRANT_IDS.g2, status: 'submitted', submitted_at: '2025-01-15T10:00:00Z', deadline: '2025-09-15' },
  { id: applicationIds.app3, organization_id: ORG_IDS.green, grant_id: GRANT_IDS.g1, status: 'draft', deadline: '2025-06-30' },
];

const proposals = [
  { id: 'p0000001-0000-4000-8000-000000000001', application_id: applicationIds.app1, version: 1, content: 'Our organisation has been supporting the local community for five years. We seek funding to expand our Community Kitchen and Job Club programmes to reach 200 more people in the next 12 months.' },
  { id: 'p0000002-0000-4000-8000-000000000002', application_id: applicationIds.app2, version: 1, content: 'Green Futures CIC proposes to use this grant to install solar panels and upgrade our transport fleet to electric vehicles, reducing our carbon footprint by an estimated 8 tonnes per year.' },
  { id: 'p0000003-0000-4000-8000-000000000003', application_id: applicationIds.app3, version: 1, content: 'We are applying for the Community Impact Fund to pilot a new youth mentoring programme in partnership with local schools.' },
];

const documents = [
  { id: 'doc0001-0000-4000-8000-000000000001', application_id: applicationIds.app1, kind: 'supporting', file_name: 'governance.pdf', content_type: 'application/pdf', file_path: '/uploads/governance.pdf' },
  { id: 'doc0002-0000-4000-8000-000000000002', application_id: applicationIds.app2, kind: 'supporting', file_name: 'accounts-2024.pdf', content_type: 'application/pdf', file_path: '/uploads/accounts-2024.pdf' },
];

const budgets = [
  { id: 'budget01-0000-4000-8000-000000000001', application_id: applicationIds.app1, template_id: null, json_data: JSON.stringify({ items: [{ name: 'Staff', amount: 25000 }, { name: 'Materials', amount: 5000 }, { name: 'Overhead', amount: 3000 }], total: 33000 }) },
  { id: 'budget02-0000-4000-8000-000000000002', application_id: applicationIds.app2, template_id: null, json_data: JSON.stringify({ items: [{ name: 'Solar installation', amount: 40000 }, { name: 'EV lease', amount: 12000 }], total: 52000 }) },
  { id: 'budget03-0000-4000-8000-000000000003', application_id: applicationIds.app3, template_id: null, json_data: JSON.stringify({ items: [{ name: 'Coordinator', amount: 15000 }, { name: 'Training', amount: 3000 }], total: 18000 }) },
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

  const run = (sql, params = []) => pool.query(sql, params);

  // Users
  for (const u of users) {
    await run(
      `INSERT INTO users (id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role, updated_at = CURRENT_TIMESTAMP`,
      [u.id, u.email, passwordHash, u.name ?? null, u.role]
    );
  }

  // Organizations
  for (const o of organizations) {
    await run(
      `INSERT INTO organizations (id, name, mission, sector, location)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, mission = EXCLUDED.mission, sector = EXCLUDED.sector, location = EXCLUDED.location, updated_at = CURRENT_TIMESTAMP`,
      [o.id, o.name, o.mission ?? null, o.sector ?? null, o.location ?? null]
    );
  }

  // User-organizations
  for (const uo of userOrganizations) {
    await run(
      `INSERT INTO user_organizations (user_id, organization_id, role) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role`,
      [uo.user_id, uo.organization_id, uo.role]
    );
  }

  // Organization financials
  for (const f of organizationFinancials) {
    await run(
      `INSERT INTO organization_financials (id, organization_id, annual_turnover, year_end)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id, annual_turnover = EXCLUDED.annual_turnover, year_end = EXCLUDED.year_end, updated_at = CURRENT_TIMESTAMP`,
      [f.id, f.organization_id, f.annual_turnover ?? null, f.year_end ?? null]
    );
  }

  // Impact metrics
  for (const m of impactMetrics) {
    await run(
      `INSERT INTO impact_metrics (id, organization_id, name, value, period)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id, name = EXCLUDED.name, value = EXCLUDED.value, period = EXCLUDED.period`,
      [m.id, m.organization_id, m.name, m.value ?? null, m.period ?? null]
    );
  }

  // Programmes
  for (const p of programmes) {
    await run(
      `INSERT INTO programmes (id, organization_id, name, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id, name = EXCLUDED.name, description = EXCLUDED.description`,
      [p.id, p.organization_id, p.name, p.description ?? null]
    );
  }

  // Grants
  for (const g of grants) {
    await run(
      `INSERT INTO grants (id, title, description, funder, amount_min, amount_max, deadline, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, funder = EXCLUDED.funder,
         amount_min = EXCLUDED.amount_min, amount_max = EXCLUDED.amount_max, deadline = EXCLUDED.deadline, source = EXCLUDED.source, updated_at = CURRENT_TIMESTAMP`,
      [g.id, g.title, g.description, g.funder, g.amount_min, g.amount_max, g.deadline, g.source]
    );
  }

  // Applications
  for (const a of applications) {
    await run(
      `INSERT INTO applications (id, organization_id, grant_id, status, submitted_at, deadline)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id, grant_id = EXCLUDED.grant_id, status = EXCLUDED.status, submitted_at = EXCLUDED.submitted_at, deadline = EXCLUDED.deadline, updated_at = CURRENT_TIMESTAMP`,
      [a.id, a.organization_id, a.grant_id, a.status, a.submitted_at ?? null, a.deadline ?? null]
    );
  }

  // Proposals
  for (const p of proposals) {
    await run(
      `INSERT INTO proposals (id, application_id, version, content)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET application_id = EXCLUDED.application_id, version = EXCLUDED.version, content = EXCLUDED.content`,
      [p.id, p.application_id, p.version, p.content ?? null]
    );
  }

  // Documents
  for (const d of documents) {
    await run(
      `INSERT INTO documents (id, application_id, kind, file_name, content_type, file_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET application_id = EXCLUDED.application_id, kind = EXCLUDED.kind, file_name = EXCLUDED.file_name, content_type = EXCLUDED.content_type, file_path = EXCLUDED.file_path`,
      [d.id, d.application_id, d.kind, d.file_name ?? null, d.content_type ?? null, d.file_path ?? null]
    );
  }

  // Budgets
  for (const b of budgets) {
    await run(
      `INSERT INTO budgets (id, application_id, template_id, json_data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET application_id = EXCLUDED.application_id, template_id = EXCLUDED.template_id, json_data = EXCLUDED.json_data, updated_at = CURRENT_TIMESTAMP`,
      [b.id, b.application_id, b.template_id ?? null, b.json_data ?? null]
    );
  }

  await pool.end();
  console.log('PostgreSQL: seed data inserted (users, orgs, grants, applications, proposals, documents, budgets).');
}

function runSqlite(db, sql, params = []) {
  const stmt = db.prepare(sql);
  return params.length ? stmt.run(...params) : stmt.run();
}

async function seedSqlite() {
  const { default: Database } = await import('better-sqlite3');
  const schemaPath = path.join(__dirname, '../src/db/schema.sql');
  const dbPath = path.join(__dirname, '../data/grantflow.db');
  mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  for (const u of users) {
    runSqlite(db, `INSERT OR REPLACE INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`, [u.id, u.email, passwordHash, u.name ?? null, u.role]);
  }
  for (const o of organizations) {
    runSqlite(db, `INSERT OR REPLACE INTO organizations (id, name, mission, sector, location) VALUES (?, ?, ?, ?, ?)`, [o.id, o.name, o.mission ?? null, o.sector ?? null, o.location ?? null]);
  }
  for (const uo of userOrganizations) {
    runSqlite(db, `INSERT OR REPLACE INTO user_organizations (user_id, organization_id, role) VALUES (?, ?, ?)`, [uo.user_id, uo.organization_id, uo.role]);
  }
  for (const f of organizationFinancials) {
    runSqlite(db, `INSERT OR REPLACE INTO organization_financials (id, organization_id, annual_turnover, year_end, json_data) VALUES (?, ?, ?, ?, ?)`, [f.id, f.organization_id, f.annual_turnover ?? null, f.year_end ?? null, null]);
  }
  for (const m of impactMetrics) {
    runSqlite(db, `INSERT OR REPLACE INTO impact_metrics (id, organization_id, name, value, period) VALUES (?, ?, ?, ?, ?)`, [m.id, m.organization_id, m.name, m.value ?? null, m.period ?? null]);
  }
  for (const p of programmes) {
    runSqlite(db, `INSERT OR REPLACE INTO programmes (id, organization_id, name, description) VALUES (?, ?, ?, ?)`, [p.id, p.organization_id, p.name, p.description ?? null]);
  }
  for (const g of grants) {
    runSqlite(db, `INSERT OR REPLACE INTO grants (id, title, description, funder, amount_min, amount_max, deadline, eligibility_json, requirements_json, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [g.id, g.title, g.description, g.funder, g.amount_min, g.amount_max, g.deadline, null, null, g.source]);
  }
  for (const a of applications) {
    runSqlite(db, `INSERT OR REPLACE INTO applications (id, organization_id, grant_id, status, submitted_at, deadline) VALUES (?, ?, ?, ?, ?, ?)`, [a.id, a.organization_id, a.grant_id, a.status, a.submitted_at ?? null, a.deadline ?? null]);
  }
  for (const p of proposals) {
    runSqlite(db, `INSERT OR REPLACE INTO proposals (id, application_id, version, content) VALUES (?, ?, ?, ?)`, [p.id, p.application_id, p.version, p.content ?? null]);
  }
  for (const d of documents) {
    runSqlite(db, `INSERT OR REPLACE INTO documents (id, application_id, kind, file_name, content_type, file_path) VALUES (?, ?, ?, ?, ?, ?)`, [d.id, d.application_id, d.kind, d.file_name ?? null, d.content_type ?? null, d.file_path ?? null]);
  }
  for (const b of budgets) {
    runSqlite(db, `INSERT OR REPLACE INTO budgets (id, application_id, template_id, json_data) VALUES (?, ?, ?, ?)`, [b.id, b.application_id, b.template_id ?? null, b.json_data ?? null]);
  }

  db.close();
  console.log('SQLite: seed data inserted (users, orgs, grants, applications, proposals, documents, budgets).');
}

async function main() {
  if (process.env.DATABASE_URL) {
    await seedPg();
  } else {
    await seedSqlite();
  }
  console.log('Seed users: demo@example.com / password, admin@example.com / password');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
