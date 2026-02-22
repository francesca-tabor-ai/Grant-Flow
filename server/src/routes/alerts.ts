import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { getDeadlineAlerts } from '../agents/deadlines.js';
import { checkCompliance } from '../agents/complianceChecker.js';

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

router.get('/deadlines', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const alerts = getDeadlineAlerts(user.userId);
  res.json(alerts);
});

router.get('/applications/:applicationId/compliance', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { applicationId } = req.params;
  if (!canAccessApplication(user.userId, applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const result = checkCompliance(applicationId);
  res.json(result);
});

router.post('/applications/:applicationId/validate', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { applicationId } = req.params;
  if (!canAccessApplication(user.userId, applicationId)) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const result = checkCompliance(applicationId);
  if (!result.ready) {
    res.status(400).json({ valid: false, ...result });
    return;
  }
  res.json({ valid: true, ...result });
});

export default router;
