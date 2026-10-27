import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AuthService } from '../services/AuthService.js';
import type { AuthedRequest } from './authMiddleware.js';
import { requireAdmin, requireAuth } from './authMiddleware.js';
import {
  changePasswordSchema,
  createUserSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  updateSettingsSchema,
} from './authValidators.js';

function auth(): AuthService {
  return new AuthService(new UserRepository(getDb()));
}

export function createAuthRouter(): Router {
  const router = Router();

  router.post('/login', (req, res, next) => {
    try {
      const body = loginSchema.parse(req.body);
      const result = auth().login(body.email, body.password);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  router.post('/register', (req, res, next) => {
    try {
      const body = registerSchema.parse(req.body);
      const result = auth().register(body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  });

  router.get('/me', requireAuth, (req: AuthedRequest, res) => {
    res.json(req.user);
  });

  router.patch('/profile', requireAuth, (req: AuthedRequest, res, next) => {
    try {
      const body = updateProfileSchema.parse(req.body);
      const user = auth().updateProfile(req.user!.id, body);
      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.patch('/password', requireAuth, (req: AuthedRequest, res, next) => {
    try {
      const body = changePasswordSchema.parse(req.body);
      auth().changePassword(req.user!.id, body.currentPassword, body.newPassword);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  router.patch('/settings', requireAuth, (req: AuthedRequest, res, next) => {
    try {
      const body = updateSettingsSchema.parse(req.body);
      const user = auth().updateSettings(req.user!.id, body);
      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.post('/users', requireAuth, requireAdmin, (req: AuthedRequest, res, next) => {
    try {
      const body = createUserSchema.parse(req.body);
      const user = auth().createUser(req.user!, body);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
