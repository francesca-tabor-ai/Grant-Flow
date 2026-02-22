import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { generateProposalDraft } from '../agents/proposalWriter.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

async function canAccessApplication(userId: string, applicationId: string): Promise<boolean> {
  const row = await db.get(
    `SELECT 1 FROM applications a
     JOIN user_organizations uo ON uo.organization_id = a.organization_id
     WHERE a.id = $1 AND uo.user_id = $2`,
    [applicationId, userId]
  );
  return !!row;
}

router.get('/applications/:applicationId/proposals', async (req, res) => {
  const user = req.user!;
  if (!(await canAccessApplication(user.userId, req.params.applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const rows = (await db.all(
    'SELECT id, application_id, version, content, created_at FROM proposals WHERE application_id = $1 ORDER BY version DESC',
    [req.params.applicationId]
  )) as Array<Record<string, unknown>>;
  res.json(rows);
});

router.post('/applications/:applicationId/proposals/generate', async (req, res) => {
  const user = req.user!;
  const { applicationId } = req.params;
  if (!(await canAccessApplication(user.userId, applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const app = (await db.get('SELECT organization_id, grant_id FROM applications WHERE id = $1', [
    applicationId,
  ])) as { organization_id: string; grant_id: string } | undefined;
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  try {
    const draft = await generateProposalDraft(app.organization_id, app.grant_id);
    const vRow = (await db.get(
      'SELECT COALESCE(MAX(version), 0) + 1 AS v FROM proposals WHERE application_id = $1',
      [applicationId]
    )) as { v: number };
    const nextVersion = vRow?.v ?? 1;
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO proposals (id, application_id, version, content) VALUES ($1, $2, $3, $4)',
      [id, applicationId, nextVersion, draft.content]
    );
    const row = await db.get('SELECT * FROM proposals WHERE id = $1', [id]);
    res.status(201).json({ proposal: row, draft });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Generation failed' });
  }
});

router.get('/applications/:applicationId/proposals/:proposalId', async (req, res) => {
  const user = req.user!;
  if (!(await canAccessApplication(user.userId, req.params.applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const row = (await db.get(
    'SELECT * FROM proposals WHERE id = $1 AND application_id = $2',
    [req.params.proposalId, req.params.applicationId]
  )) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }
  res.json(row);
});

router.patch('/applications/:applicationId/proposals/:proposalId', async (req, res) => {
  const user = req.user!;
  if (!(await canAccessApplication(user.userId, req.params.applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const existing = await db.get(
    'SELECT id FROM proposals WHERE id = $1 AND application_id = $2',
    [req.params.proposalId, req.params.applicationId]
  );
  if (!existing) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }
  const { content } = req.body ?? {};
  if (typeof content !== 'string') {
    res.status(400).json({ error: 'content required' });
    return;
  }
  await db.run('UPDATE proposals SET content = $1 WHERE id = $2', [content, req.params.proposalId]);
  const row = await db.get('SELECT * FROM proposals WHERE id = $1', [req.params.proposalId]);
  res.json(row);
});

export default router;
