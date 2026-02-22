import { Router } from 'express';
import { db } from '../db/index.js';
import { optionalAuth, authMiddleware } from '../auth.js';
import { getMatchesForOrganization } from '../agents/grantMatching.js';
import { analyseEligibility } from '../agents/eligibility.js';
import type { GrantProfile } from '../agents/eligibility.js';

const router = Router();
router.use(optionalAuth);

// Favorites (must be before /:id to avoid "favorites" matching as id)
router.get('/favorites', authMiddleware, async (req, res) => {
  const user = req.user!;
  const rows = (await db.all(
    `SELECT g.id, g.title, g.description, g.funder, g.amount_min, g.amount_max, g.deadline
     FROM user_grant_favorites u JOIN grants g ON u.grant_id = g.id
     WHERE u.user_id = $1 ORDER BY u.created_at DESC`,
    [user.userId]
  )) as Array<Record<string, unknown>>;
  res.json(rows);
});

router.post('/:id/favorite', authMiddleware, async (req, res) => {
  const user = req.user!;
  const grantId = req.params.id;
  const exists = await db.get('SELECT id FROM grants WHERE id = $1', [grantId]);
  if (!exists) {
    res.status(404).json({ error: 'Grant not found' });
    return;
  }
  await db.run(
    'INSERT INTO user_grant_favorites (user_id, grant_id) VALUES ($1, $2) ON CONFLICT (user_id, grant_id) DO NOTHING',
    [user.userId, grantId]
  );
  res.status(201).json({ favorited: true });
});

router.delete('/:id/favorite', authMiddleware, async (req, res) => {
  const user = req.user!;
  const grantId = req.params.id;
  const r = await db.run(
    'DELETE FROM user_grant_favorites WHERE user_id = $1 AND grant_id = $2',
    [user.userId, grantId]
  );
  const changes = (r as { changes?: number }).changes ?? 0;
  res.json({ favorited: false, removed: changes > 0 });
});

router.get('/', async (req, res) => {
  const { q, funder, sort = 'created_at', order = 'desc', organization_id } = req.query as Record<string, string>;
  const user = req.user!;

  let rows: Array<Record<string, unknown>>;
  if (organization_id && user) {
    const canAccess = await db.get(
      'SELECT 1 FROM user_organizations WHERE user_id = $1 AND organization_id = $2',
      [user.userId, organization_id]
    );
    if (canAccess) {
      const matches = await getMatchesForOrganization(organization_id);
      rows = matches.map((m) => ({
        ...m.grant,
        eligibility_score: m.eligibility.score,
        eligibility_eligible: m.eligibility.eligible,
        eligibility_reasons: m.eligibility.reasons,
        eligibility_warnings: m.eligibility.warnings,
      }));
      if (q) {
        const lower = q.toLowerCase();
        rows = rows.filter(
          (r) =>
            String(r.title).toLowerCase().includes(lower) ||
            String(r.description).toLowerCase().includes(lower) ||
            String(r.funder).toLowerCase().includes(lower)
        );
      }
      if (funder) {
        const f = funder.toLowerCase();
        rows = rows.filter((r) => String(r.funder).toLowerCase().includes(f));
      }
      const allowedSort = ['created_at', 'deadline', 'title', 'amount_max', 'eligibility_score'];
      const sortCol = allowedSort.includes(sort) ? sort : 'eligibility_score';
      const dir = order === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const va = a[sortCol];
        const vb = b[sortCol];
        if (sortCol === 'eligibility_score') return ((vb as number) - (va as number)) * dir;
        if (va == null && vb == null) return 0;
        if (va == null) return dir;
        if (vb == null) return -dir;
        return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
      });
    } else {
      rows = [];
    }
  } else {
    let sql = 'SELECT * FROM grants WHERE 1=1';
    const params: unknown[] = [];
    if (q) {
      sql += ' AND (title LIKE $' + (params.length + 1) + ' OR description LIKE $' + (params.length + 2) + ' OR funder LIKE $' + (params.length + 3) + ')';
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (funder) {
      sql += ' AND funder LIKE $' + (params.length + 1);
      params.push(`%${funder}%`);
    }
    const allowedSort = ['created_at', 'deadline', 'title', 'amount_max'];
    const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
    const dir = order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortCol} ${dir}`;
    rows = (await db.all(sql, params)) as Array<Record<string, unknown>>;
  }
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const row = (await db.get('SELECT * FROM grants WHERE id = $1', [req.params.id])) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Grant not found' });
    return;
  }
  res.json(row);
});

router.get('/:id/eligibility', authMiddleware, async (req, res) => {
  const { organization_id } = req.query as { organization_id?: string };
  const user = req.user!;
  if (!organization_id) {
    res.status(400).json({ error: 'organization_id required' });
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
  const grant = (await db.get(
    'SELECT id, title, description, funder, amount_min, amount_max, eligibility_json, requirements_json FROM grants WHERE id = $1',
    [req.params.id]
  )) as GrantProfile | undefined;
  if (!grant) {
    res.status(404).json({ error: 'Grant not found' });
    return;
  }
  const orgRow = (await db.get(
    'SELECT sector, location, mission FROM organizations WHERE id = $1',
    [organization_id]
  )) as { sector: string | null; location: string | null; mission: string | null } | undefined;
  const financial = (await db.get(
    'SELECT annual_turnover FROM organization_financials WHERE organization_id = $1',
    [organization_id]
  )) as { annual_turnover: number | null } | undefined;
  const org = {
    sector: orgRow?.sector ?? null,
    location: orgRow?.location ?? null,
    mission: orgRow?.mission ?? null,
    annualTurnover: financial?.annual_turnover ?? null,
  };
  const eligibility = analyseEligibility(org, grant);
  res.json(eligibility);
});

export default router;
