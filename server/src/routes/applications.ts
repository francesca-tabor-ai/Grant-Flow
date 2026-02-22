import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const rows = db.prepare(
    `SELECT a.*, g.title AS grant_title, g.funder, g.deadline AS grant_deadline
     FROM applications a
     JOIN grants g ON g.id = a.grant_id
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE uo.user_id = ?
     ORDER BY a.updated_at DESC`
  ).all(user.userId) as Array<Record<string, unknown>>;
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const row = db.prepare(
    `SELECT a.*, g.title AS grant_title, g.funder, g.deadline AS grant_deadline
     FROM applications a
     JOIN grants g ON g.id = a.grant_id
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE a.id = ? AND uo.user_id = ?`
  ).get(req.params.id, user.userId) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(row);
});

router.post('/', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { organization_id, grant_id } = req.body ?? {};
  if (!organization_id || !grant_id) {
    res.status(400).json({ error: 'organization_id and grant_id required' });
    return;
  }
  const canAccess = db.prepare(
    'SELECT 1 FROM user_organizations WHERE user_id = ? AND organization_id = ?'
  ).get(user.userId, organization_id);
  if (!canAccess) {
    res.status(403).json({ error: 'Not allowed for this organisation' });
    return;
  }
  const grant = db.prepare('SELECT deadline FROM grants WHERE id = ?').get(grant_id) as { deadline: string | null } | undefined;
  if (!grant) {
    res.status(404).json({ error: 'Grant not found' });
    return;
  }
  const id = crypto.randomUUID();
  try {
    db.prepare(
      'INSERT INTO applications (id, organization_id, grant_id, status, deadline) VALUES (?, ?, ?, ?, ?)'
    ).run(id, organization_id, grant_id, 'draft', grant.deadline ?? null);
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Application already exists for this grant' });
      return;
    }
    throw e;
  }
  const row = db.prepare(
    'SELECT a.*, g.title AS grant_title FROM applications a JOIN grants g ON g.id = a.grant_id WHERE a.id = ?'
  ).get(id);
  res.status(201).json(row);
});

router.patch('/:id', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const exists = db.prepare(
    `SELECT 1 FROM applications a
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE a.id = ? AND uo.user_id = ?`
  ).get(req.params.id, user.userId);
  if (!exists) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const { status } = req.body ?? {};
  if (status !== undefined) {
    const allowed = ['draft', 'in_progress', 'submitted'];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    if (status === 'submitted') {
      db.prepare('UPDATE applications SET status = ?, submitted_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?')
        .run(status, req.params.id);
    } else {
      db.prepare('UPDATE applications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(status, req.params.id);
    }
  }
  const row = db.prepare(
    'SELECT a.*, g.title AS grant_title FROM applications a JOIN grants g ON g.id = a.grant_id WHERE a.id = ?'
  ).get(req.params.id);
  res.json(row);
});

export default router;
