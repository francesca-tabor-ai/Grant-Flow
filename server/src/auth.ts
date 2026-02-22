import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db/index.js';
import { UnauthorizedError, ForbiddenError } from './shared/_core/errors.js';
import { UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG } from './shared/const.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'grantflow-dev-secret-change-in-production';

export type JWTPayload = { userId: string; email: string; role: string };

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    next(UnauthorizedError(UNAUTHED_ERR_MSG));
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    next(UnauthorizedError(UNAUTHED_ERR_MSG));
    return;
  }
  req.user = payload;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      next(UnauthorizedError(UNAUTHED_ERR_MSG));
      return;
    }
    if (!user.role || !roles.includes(user.role)) {
      next(ForbiddenError(NOT_ADMIN_ERR_MSG));
      return;
    }
    next();
  };
}
