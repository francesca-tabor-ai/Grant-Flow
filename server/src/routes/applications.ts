import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const user = req.user!;
  const rows = (await db.all(
    `SELECT a.*, g.title AS grant_title, g.funder, g.deadline AS grant_deadline
     FROM applications a
     JOIN grants g ON g.id = a.grant_id
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE uo.user_id = $1
     ORDER BY a.updated_at DESC`,
    [user.userId]
  )) as Array<Record<string, unknown>>;
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const user = req.user!;
  const row = (await db.get(
    `SELECT a.*, g.title AS grant_title, g.funder, g.deadline AS grant_deadline
     FROM applications a
     JOIN grants g ON g.id = a.grant_id
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE a.id = $1 AND uo.user_id = $2`,
    [req.params.id, user.userId]
  )) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(row);
});

router.post('/', async (req, res) => {
  const user = req.user!;
  const { organization_id, grant_id } = req.body ?? {};
  if (!organization_id || !grant_id) {
    res.status(400).json({ error: 'organization_id and grant_id required' });
    return;
  }
  const canAccess = await db.get(
    'SELECT 1 FROM user_organizations WHERE user_id = $1 AND organization_id = $2',
    [user.userId, organization_id]
  );
  if (!canAccess) {
    res.status(403).json({ error: 'Not allowed for this organisation' });
    return;
  }
  const grant = (await db.get('SELECT deadline FROM grants WHERE id = $1', [
    grant_id,
  ])) as { deadline: string | null } | undefined;
  if (!grant) {
    res.status(404).json({ error: 'Grant not found' });
    return;
  }
  const id = crypto.randomUUID();
  try {
    await db.run(
      'INSERT INTO applications (id, organization_id, grant_id, status, deadline) VALUES ($1, $2, $3, $4, $5)',
      [id, organization_id, grant_id, 'draft', grant.deadline ?? null]
    );
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE' || err?.code === '23505') {
      res.status(409).json({ error: 'Application already exists for this grant' });
      return;
    }
    throw e;
  }
  const row = await db.get(
    'SELECT a.*, g.title AS grant_title FROM applications a JOIN grants g ON g.id = a.grant_id WHERE a.id = $1',
    [id]
  );
  res.status(201).json(row);
});

router.patch('/:id', async (req, res) => {
  const user = req.user!;
  const exists = await db.get(
    `SELECT 1 FROM applications a
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE a.id = $1 AND uo.user_id = $2`,
    [req.params.id, user.userId]
  );
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
      await db.run(
        "UPDATE applications SET status = $1, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [status, req.params.id]
      );
    } else {
      await db.run(
        'UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, req.params.id]
      );
    }
  }
  const row = await db.get(
    'SELECT a.*, g.title AS grant_title FROM applications a JOIN grants g ON g.id = a.grant_id WHERE a.id = $1',
    [req.params.id]
  );
  res.json(row);
});

export default router;
