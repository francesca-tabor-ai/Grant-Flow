-- GrantFlow AI: Core schema (organizations, grants, applications, documents, users)

-- Users and auth
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Organizations / CIC profiles
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mission TEXT,
  sector TEXT,
  location TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Link users to organizations (many-to-many)
CREATE TABLE IF NOT EXISTS user_organizations (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (user_id, organization_id)
);

-- Financial info (per organization)
CREATE TABLE IF NOT EXISTS organization_financials (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  annual_turnover REAL,
  year_end TEXT,
  json_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(organization_id)
);

-- Impact metrics and programmes
CREATE TABLE IF NOT EXISTS impact_metrics (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT,
  period TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS programmes (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Grants (discovery / database)
CREATE TABLE IF NOT EXISTS grants (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  funder TEXT,
  amount_min REAL,
  amount_max REAL,
  deadline TEXT,
  eligibility_json TEXT,
  requirements_json TEXT,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Applications (per org, per grant)
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  grant_id TEXT NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TEXT,
  deadline TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(organization_id, grant_id)
);

-- Proposals (content + version history)
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  content TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Documents (uploaded or generated)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  file_name TEXT,
  content_type TEXT,
  file_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Budgets (per application)
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  template_id TEXT,
  json_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_org ON applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_applications_grant ON applications(grant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_proposals_application ON proposals(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_application ON documents(application_id);
