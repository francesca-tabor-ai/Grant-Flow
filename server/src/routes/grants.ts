import { Router } from 'express';
import { db } from '../db/index.js';
import { optionalAuth, authMiddleware } from '../auth.js';
import { getMatchesForOrganization } from '../agents/grantMatching.js';
import { analyseEligibility } from '../agents/eligibility.js';
import type { GrantProfile } from '../agents/eligibility.js';

const router = Router();
router.use(optionalAuth);

router.get('/', (req, res) => {
  const { q, funder, sort = 'created_at', order = 'desc', organization_id } = req.query as Record<string, string>;
  const user = (req as { user?: { userId: string } }).user;

  let rows: Array<Record<string, unknown>>;
  if (organization_id && user) {
    const canAccess = db.prepare(
      'SELECT 1 FROM user_organizations WHERE user_id = ? AND organization_id = ?'
    ).get(user.userId, organization_id);
    if (canAccess) {
      const matches = getMatchesForOrganization(organization_id);
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
      sql += ' AND (title LIKE ? OR description LIKE ? OR funder LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (funder) {
      sql += ' AND funder LIKE ?';
      params.push(`%${funder}%`);
    }
    const allowedSort = ['created_at', 'deadline', 'title', 'amount_max'];
    const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
    const dir = order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortCol} ${dir}`;
    rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
  }
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM grants WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) {
    res.status(404).json({ error: 'Grant not found' });
    return;
  }
  res.json(row);
});

router.get('/:id/eligibility', authMiddleware, (req, res) => {
  const { organization_id } = req.query as { organization_id?: string };
  const user = (req as { user: { userId: string } }).user;
  if (!organization_id) {
    res.status(400).json({ error: 'organization_id required' });
    return;
  }
  const canAccess = db.prepare(
    'SELECT 1 FROM user_organizations WHERE user_id = ? AND organization_id = ?'
  ).get(user.userId, organization_id);
  if (!canAccess) {
    res.status(403).json({ error: 'Not allowed for this organisation' });
    return;
  }
  const grant = db.prepare(
    'SELECT id, title, description, funder, amount_min, amount_max, eligibility_json, requirements_json FROM grants WHERE id = ?'
  ).get(req.params.id) as GrantProfile | undefined;
  if (!grant) {
    res.status(404).json({ error: 'Grant not found' });
    return;
  }
  const orgRow = db.prepare(
    'SELECT sector, location, mission FROM organizations WHERE id = ?'
  ).get(organization_id) as { sector: string | null; location: string | null; mission: string | null } | undefined;
  const financial = db.prepare(
    'SELECT annual_turnover FROM organization_financials WHERE organization_id = ?'
  ).get(organization_id) as { annual_turnover: number | null } | undefined;
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
