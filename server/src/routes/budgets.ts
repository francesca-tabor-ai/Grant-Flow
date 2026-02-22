import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import { generateBudget, generateCostJustification } from '../agents/budgetGenerator.js';
import { listTemplates } from '../agents/budgetTemplates.js';
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

router.get('/templates', (_req, res) => {
  res.json(listTemplates());
});

router.get('/applications/:applicationId/budget', async (req, res) => {
  const user = req.user!;
  if (!(await canAccessApplication(user.userId, req.params.applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const row = (await db.get('SELECT * FROM budgets WHERE application_id = $1', [
    req.params.applicationId,
  ])) as
    | { id: string; application_id: string; template_id: string | null; json_data: string }
    | undefined;
  if (!row) {
    res.json(null);
    return;
  }
  const data = row.json_data ? JSON.parse(row.json_data) : {};
  res.json({ ...row, ...data });
});

router.post('/applications/:applicationId/budget/generate', async (req, res) => {
  const user = req.user!;
  const { applicationId } = req.params;
  if (!(await canAccessApplication(user.userId, applicationId))) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const appRow = (await db.get('SELECT grant_id FROM applications WHERE id = $1', [
    applicationId,
  ])) as { grant_id: string } | undefined;
  const grant = appRow
    ? ((await db.get('SELECT title, amount_max FROM grants WHERE id = $1', [
        appRow.grant_id,
      ])) as { title: string; amount_max: number | null } | undefined)
    : undefined;
  const { template_id = 'default-project', total_amount } = req.body ?? {};
  try {
    const generated = generateBudget(template_id, {
      totalAmount: total_amount ?? grant?.amount_max ?? undefined,
      grantTitle: grant?.title,
    });
    const id = crypto.randomUUID();
    await db.run(
      'INSERT INTO budgets (id, application_id, template_id, json_data) VALUES ($1, $2, $3, $4)',
      [
        id,
        applicationId,
        template_id,
        JSON.stringify({
          lines: generated.lines,
          total: generated.total,
          justification: generated.justification,
          costJustification: generateCostJustification(generated.lines),
        }),
      ]
    );
    const row = (await db.get('SELECT * FROM budgets WHERE id = $1', [id])) as
      | { id: string; json_data: string }
      | undefined;
    const data = row?.json_data ? JSON.parse(row.json_data) : {};
    res.status(201).json({ id: row?.id, application_id: applicationId, ...data });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Generation failed' });
  }
});

export default router;
