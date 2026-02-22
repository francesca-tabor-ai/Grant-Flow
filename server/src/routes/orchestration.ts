import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { runOrchestration } from '../agents/orchestration.js';

const router = Router();
router.use(authMiddleware);

router.post('/orchestrate', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { organization_id, grant_id, generate_proposal, generate_budget, template_id } = req.body ?? {};
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
  try {
    const result = runOrchestration({
      organizationId: organization_id,
      grantId: grant_id,
      options: {
        generateProposal: !!generate_proposal,
        generateBudget: !!generate_budget,
        templateId: template_id,
      },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Orchestration failed' });
  }
});

export default router;
