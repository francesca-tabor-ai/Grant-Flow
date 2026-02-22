import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { getDeadlineAlerts } from '../agents/deadlines.js';
import { checkCompliance } from '../agents/complianceChecker.js';

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

router.get('/deadlines', async (req, res) => {
  const user = req.user!;
  const alerts = await getDeadlineAlerts(user.userId);
  res.json(alerts);
});

router.get('/applications/:applicationId/compliance', async (req, res) => {
  const user = req.user!;
  const { applicationId } = req.params;
  if (!(await canAccessApplication(user.userId, applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const result = await checkCompliance(applicationId);
  res.json(result);
});

router.post('/applications/:applicationId/validate', async (req, res) => {
  const user = req.user!;
  const { applicationId } = req.params;
  if (!(await canAccessApplication(user.userId, applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const result = await checkCompliance(applicationId);
  if (!result.ready) {
    res.status(400).json({ valid: false, ...result });
    return;
  }
  res.json({ valid: true, ...result });
});

export default router;
