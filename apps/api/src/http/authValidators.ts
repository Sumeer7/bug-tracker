import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateSettingsSchema = z.object({
  defaultView: z.enum(['board', 'list']).optional(),
  emailOnAssignment: z.boolean().optional(),
  compactCards: z.boolean().optional(),
  timezone: z.string().max(64).optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['admin', 'member', 'viewer']),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});
