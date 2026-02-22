import { Router } from 'express';
import { db } from '../db/index.js';
import { signToken, authMiddleware } from '../auth.js';
import { BadRequestError, UnauthorizedError } from '../shared/_core/errors.js';
import { UNAUTHED_ERR_MSG } from '../shared/const.js';
import crypto from 'crypto';

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/register', async (req, res, next) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !password) {
    next(BadRequestError('Email and password required'));
    return;
  }
  const id = crypto.randomUUID();
  const password_hash = hashPassword(password);
  try {
    await db.run(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
      [id, email, password_hash, name ?? null, 'user']
    );
    const token = signToken({ userId: id, email, role: 'user' });
    res.status(201).json({ token, user: { id, email, name: name ?? null, role: 'user' } });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE' || err?.code === '23505') {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    next(BadRequestError('Email and password required'));
    return;
  }
  const row = (await db.get(
    'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
    [email]
  )) as
    | { id: string; email: string; password_hash: string; name: string | null; role: string }
    | undefined;
  if (!row || row.password_hash !== hashPassword(password)) {
    next(UnauthorizedError('Invalid email or password'));
    return;
  }
  const token = signToken({ userId: row.id, email: row.email, role: row.role });
  res.json({ token, user: { id: row.id, email: row.email, name: row.name, role: row.role } });
});

router.get('/me', authMiddleware, async (req, res, next) => {
  const user = req.user!;
  const row = (await db.get('SELECT id, email, name, role FROM users WHERE id = $1', [
    user.userId,
  ])) as
    | { id: string; email: string; name: string | null; role: string }
    | undefined;
  if (!row) {
    next(UnauthorizedError(UNAUTHED_ERR_MSG));
    return;
  }
  res.json({ user: { id: row.id, email: row.email, name: row.name, role: row.role } });
});

export default router;
