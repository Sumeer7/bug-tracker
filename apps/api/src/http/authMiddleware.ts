import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { getDb } from '../db/connection.js';
import type { User } from '../domain/types.js';

export interface AuthedRequest extends Request {
  user?: User;
}

function getAuthService() {
  return new AuthService(new UserRepository(getDb()));
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Login required', code: 'AUTH_REQUIRED' });
    return;
  }
  try {
    req.user = getAuthService().verifyToken(token);
    next();
  } catch (e) {
    next(e);
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Login required', code: 'AUTH_REQUIRED' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin only', code: 'FORBIDDEN' });
    return;
  }
  next();
}
