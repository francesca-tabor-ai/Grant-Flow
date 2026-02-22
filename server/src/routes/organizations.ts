import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const user = req.user!;
  const rows = (await db.all(
    `SELECT o.* FROM organizations o
     JOIN user_organizations uo ON uo.organization_id = o.id
     WHERE uo.user_id = $1`,
    [user.userId]
  )) as Array<Record<string, unknown>>;
  res.json(rows);
});

router.post('/', async (req, res) => {
  const user = req.user!;
  const { name, mission, sector, location } = req.body ?? {};
  if (!name) {
    res.status(400).json({ error: 'Organization name required' });
    return;
  }
  const id = crypto.randomUUID();
  await db.run(
    'INSERT INTO organizations (id, name, mission, sector, location) VALUES ($1, $2, $3, $4, $5)',
    [id, name, mission ?? null, sector ?? null, location ?? null]
  );
  await db.run(
    'INSERT INTO user_organizations (user_id, organization_id, role) VALUES ($1, $2, $3)',
    [user.userId, id, 'admin']
  );
  res.status(201).json({ id, name, mission, sector, location });
});

router.get('/:id', async (req, res) => {
  const user = req.user!;
  const row = (await db.get(
    `SELECT o.* FROM organizations o
     JOIN user_organizations uo ON uo.organization_id = o.id
     WHERE o.id = $1 AND uo.user_id = $2`,
    [req.params.id, user.userId]
  )) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }
  res.json(row);
});

router.patch('/:id', async (req, res) => {
  const user = req.user!;
  const exists = await db.get(
    'SELECT 1 FROM user_organizations WHERE organization_id = $1 AND user_id = $2',
    [req.params.id, user.userId]
  );
  if (!exists) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }
  const { name, mission, sector, location } = req.body ?? {};
  const updates: string[] = [];
  const values: unknown[] = [];
  if (name !== undefined) {
    updates.push('name = $' + (values.length + 1));
    values.push(name);
  }
  if (mission !== undefined) {
    updates.push('mission = $' + (values.length + 1));
    values.push(mission);
  }
  if (sector !== undefined) {
    updates.push('sector = $' + (values.length + 1));
    values.push(sector);
  }
  if (location !== undefined) {
    updates.push('location = $' + (values.length + 1));
    values.push(location);
  }
  if (updates.length === 0) {
    const row = await db.get('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
    res.json(row);
    return;
  }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  const whereId = values.length + 1;
  values.push(req.params.id);
  await db.run(
    `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${whereId}`,
    values
  );
  const row = await db.get('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
  res.json(row);
});

export default router;
