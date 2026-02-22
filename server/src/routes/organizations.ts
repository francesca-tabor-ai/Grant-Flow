import { Router } from 'express';
import { db } from '../db/index.js';
import { authMiddleware } from '../auth.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const rows = db.prepare(
    `SELECT o.* FROM organizations o
     JOIN user_organizations uo ON uo.organization_id = o.id
     WHERE uo.user_id = ?`
  ).all(user.userId) as Array<Record<string, unknown>>;
  res.json(rows);
});

router.post('/', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const { name, mission, sector, location } = req.body ?? {};
  if (!name) {
    res.status(400).json({ error: 'Organization name required' });
    return;
  }
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO organizations (id, name, mission, sector, location) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, mission ?? null, sector ?? null, location ?? null);
  db.prepare(
    'INSERT INTO user_organizations (user_id, organization_id, role) VALUES (?, ?, ?)'
  ).run(user.userId, id, 'admin');
  res.status(201).json({ id, name, mission, sector, location });
});

router.get('/:id', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const row = db.prepare(
    `SELECT o.* FROM organizations o
     JOIN user_organizations uo ON uo.organization_id = o.id
     WHERE o.id = ? AND uo.user_id = ?`
  ).get(req.params.id, user.userId) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }
  res.json(row);
});

router.patch('/:id', (req, res) => {
  const user = (req as { user: { userId: string } }).user;
  const exists = db.prepare(
    `SELECT 1 FROM user_organizations WHERE organization_id = ? AND user_id = ?`
  ).get(req.params.id, user.userId);
  if (!exists) {
    res.status(404).json({ error: 'Organization not found' });
    return;
  }
  const { name, mission, sector, location } = req.body ?? {};
  const updates: string[] = [];
  const values: unknown[] = [];
  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (mission !== undefined) { updates.push('mission = ?'); values.push(mission); }
  if (sector !== undefined) { updates.push('sector = ?'); values.push(sector); }
  if (location !== undefined) { updates.push('location = ?'); values.push(location); }
  if (updates.length === 0) {
    const row = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
    res.json(row);
    return;
  }
  updates.push("updated_at = datetime('now')");
  values.push(req.params.id);
  db.prepare(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  const row = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
  res.json(row);
});

export default router;
