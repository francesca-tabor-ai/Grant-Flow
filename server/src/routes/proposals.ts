import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { generateProposalDraft } from '../agents/proposalWriter.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

function canAccessApplication(userId: string, applicationId: string): boolean {
  const row = db.prepare(
    `SELECT 1 FROM applications a
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE a.id = ? AND uo.user_id = ?`
  ).get(applicationId, userId);
  return !!row;
}

router.get('/applications/:applicationId/proposals', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  if (!canAccessApplication(user.userId, req.params.applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const rows = db.prepare(
    'SELECT id, application_id, version, content, created_at FROM proposals WHERE application_id = ? ORDER BY version DESC'
  ).all(req.params.applicationId) as Array<Record<string, unknown>>;
  res.json(rows);
});

router.post('/applications/:applicationId/proposals/generate', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { applicationId } = req.params;
  if (!canAccessApplication(user.userId, applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const app = db.prepare('SELECT organization_id, grant_id FROM applications WHERE id = ?').get(applicationId) as
    | { organization_id: string; grant_id: string }
    | undefined;
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  try {
    const draft = generateProposalDraft(app.organization_id, app.grant_id);
    const nextVersion = (db.prepare('SELECT COALESCE(MAX(version), 0) + 1 AS v FROM proposals WHERE application_id = ?').get(applicationId) as { v: number }).v;
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO proposals (id, application_id, version, content) VALUES (?, ?, ?, ?)').run(
      id,
      applicationId,
      nextVersion,
      draft.content
    );
    const row = db.prepare('SELECT * FROM proposals WHERE id = ?').get(id);
    res.status(201).json({ proposal: row, draft });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Generation failed' });
  }
});

router.get('/applications/:applicationId/proposals/:proposalId', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  if (!canAccessApplication(user.userId, req.params.applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const row = db.prepare(
    'SELECT * FROM proposals WHERE id = ? AND application_id = ?'
  ).get(req.params.proposalId, req.params.applicationId) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }
  res.json(row);
});

router.patch('/applications/:applicationId/proposals/:proposalId', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  if (!canAccessApplication(user.userId, req.params.applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const existing = db.prepare(
    'SELECT id FROM proposals WHERE id = ? AND application_id = ?'
  ).get(req.params.proposalId, req.params.applicationId);
  if (!existing) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }
  const { content } = req.body ?? {};
  if (typeof content !== 'string') {
    res.status(400).json({ error: 'content required' });
    return;
  }
  db.prepare('UPDATE proposals SET content = ? WHERE id = ?').run(content, req.params.proposalId);
  const row = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.proposalId);
  res.json(row);
});

export default router;
