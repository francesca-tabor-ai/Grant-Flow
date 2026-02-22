import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { proposalToPdfBuffer } from '../lib/exportPdf.js';
import { proposalToDocxBuffer } from '../lib/exportDocx.js';

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

router.get('/applications/:applicationId/assembly', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { applicationId } = req.params;
  if (!canAccessApplication(user.userId, applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const proposal = db.prepare('SELECT id, version, created_at FROM proposals WHERE application_id = ? ORDER BY version DESC LIMIT 1').get(applicationId);
  const budget = db.prepare('SELECT id, created_at FROM budgets WHERE application_id = ?').get(applicationId);
  res.json({
    proposal: proposal ? { id: (proposal as { id: string }).id, version: (proposal as { version: number }).version, created_at: (proposal as { created_at: string }).created_at } : null,
    budget: budget ? { id: (budget as { id: string }).id, created_at: (budget as { created_at: string }).created_at } : null,
    exportLinks: {
      pdf: `/api/applications/${applicationId}/export/pdf`,
      docx: `/api/applications/${applicationId}/export/docx`,
    },
  });
});

router.get('/applications/:applicationId/export/pdf', async (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { applicationId } = req.params;
  if (!canAccessApplication(user.userId, applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const app = db.prepare(
    'SELECT a.id, g.title AS grant_title FROM applications a JOIN grants g ON g.id = a.grant_id WHERE a.id = ?'
  ).get(applicationId) as { id: string; grant_title: string } | undefined;
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const proposal = db.prepare(
    'SELECT content FROM proposals WHERE application_id = ? ORDER BY version DESC LIMIT 1'
  ).get(applicationId) as { content: string } | undefined;
  const content = proposal?.content ?? 'No proposal content yet.';
  try {
    const buf = await proposalToPdfBuffer(content, app.grant_title);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposal-${applicationId.slice(0, 8)}.pdf"`);
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Export failed' });
  }
});

router.get('/applications/:applicationId/export/docx', async (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { applicationId } = req.params;
  if (!canAccessApplication(user.userId, applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const app = db.prepare(
    'SELECT a.id, g.title AS grant_title FROM applications a JOIN grants g ON g.id = a.grant_id WHERE a.id = ?'
  ).get(applicationId) as { id: string; grant_title: string } | undefined;
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const proposal = db.prepare(
    'SELECT content FROM proposals WHERE application_id = ? ORDER BY version DESC LIMIT 1'
  ).get(applicationId) as { content: string } | undefined;
  const content = proposal?.content ?? 'No proposal content yet.';
  try {
    const buf = await proposalToDocxBuffer(content, app.grant_title);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="proposal-${applicationId.slice(0, 8)}.docx"`);
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Export failed' });
  }
});

export default router;
