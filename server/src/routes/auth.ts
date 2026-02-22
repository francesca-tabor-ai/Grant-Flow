import { Router } from 'express';
import { db } from '../db/index.js';
import { signToken, authMiddleware } from '../auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { BadRequestError, UnauthorizedError } from '../shared/_core/errors.js';
import { UNAUTHED_ERR_MSG } from '../shared/const.js';
import crypto from 'crypto';

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function trimEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

router.post('/register', asyncHandler(async (req, res, next) => {
  const raw = req.body ?? {};
  const email = trimEmail(raw.email);
  const password = typeof raw.password === 'string' ? raw.password : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() || null : null;

  if (!email) {
    next(BadRequestError('Email is required'));
    return;
  }
  if (!password) {
    next(BadRequestError('Password is required'));
    return;
  }
  if (password.length < 8) {
    next(BadRequestError('Password must be at least 8 characters'));
    return;
  }
  const id = crypto.randomUUID();
  const password_hash = hashPassword(password);
  try {
    await db.run(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
      [id, email, password_hash, name, 'user']
    );
    const token = signToken({ userId: id, email, role: 'user' });
    res.status(201).json({ token, user: { id, email, name, role: 'user' } });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE' || err?.code === '23505') {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    next(e);
  }
}));

router.post('/login', asyncHandler(async (req, res, next) => {
  const raw = req.body ?? {};
  const email = trimEmail(raw.email);
  const password = typeof raw.password === 'string' ? raw.password : '';

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
}));

router.get('/me', authMiddleware, asyncHandler(async (req, res, next) => {
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
}));

export default router;
