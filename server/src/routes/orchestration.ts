import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { runOrchestration } from '../agents/orchestration.js';

const router = Router();
router.use(authMiddleware);

router.post('/orchestrate', async (req, res) => {
  const user = req.user!;
  const { organization_id, grant_id, generate_proposal, generate_budget, template_id } = req.body ?? {};
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
  try {
    const result = await runOrchestration({
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
