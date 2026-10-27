import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { User, UserSettings } from '../domain/types.js';
import { DEFAULT_USER_SETTINGS } from '../domain/types.js';
import { AppError, NotFoundError, ValidationError } from '../domain/errors.js';
import type { UserRepository } from '../repositories/UserRepository.js';

const JWT_SECRET = process.env.PULSE_JWT_SECRET || 'pulse-dev-secret-change-in-production';
const TOKEN_TTL = '7d';

export interface AuthResult {
  token: string;
  user: User;
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  login(email: string, password: string): AuthResult {
    const user = this.users.findByEmail(email);
    if (!user) {
      throw new AppError(
        'No account found for this email. Create an account below.',
        404,
        'EMAIL_NOT_FOUND'
      );
    }
    const hash = this.users.getPasswordHash(user.id);
    if (!hash || !bcrypt.compareSync(password, hash)) {
      throw new AppError('Incorrect password. Try again or reset in Settings after sign-in.', 401, 'WRONG_PASSWORD');
    }
    return { token: this.signToken(user), user };
  }

  register(input: { name: string; email: string; password: string }): AuthResult {
    if (input.password.length < 8) throw new ValidationError('Password must be at least 8 characters');
    if (this.users.findByEmail(input.email)) {
      throw new ValidationError('An account with this email already exists. Sign in instead.');
    }
    const user = this.createMemberUser(input);
    return { token: this.signToken(user), user };
  }

  private createMemberUser(input: {
    name: string;
    email: string;
    password: string;
    role?: User['role'];
    avatarColor?: string;
  }): User {
    const colors = ['#f72585', '#4cc9f0', '#b8f397', '#ffb347', '#7209b7', '#5eead4'];
    const id = randomUUID();
    const now = new Date().toISOString();
    return this.users.create({
      id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      avatarColor: input.avatarColor ?? colors[Math.floor(Math.random() * colors.length)],
      role: input.role ?? 'member',
      passwordHash: bcrypt.hashSync(input.password, 10),
      createdAt: now,
    });
  }

  verifyToken(token: string): User {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
      const user = this.users.findById(payload.sub);
      if (!user) throw new AppError('Session expired', 401, 'AUTH_FAILED');
      return user;
    } catch {
      throw new AppError('Session expired', 401, 'AUTH_FAILED');
    }
  }

  changePassword(userId: string, currentPassword: string, newPassword: string): void {
    if (newPassword.length < 8) throw new ValidationError('Password must be at least 8 characters');
    const hash = this.users.getPasswordHash(userId);
    if (!hash || !bcrypt.compareSync(currentPassword, hash)) {
      throw new AppError('Current password is incorrect', 400, 'BAD_PASSWORD');
    }
    this.users.updatePasswordHash(userId, bcrypt.hashSync(newPassword, 10));
  }

  updateProfile(userId: string, patch: { name?: string; avatarColor?: string }): User {
    const updated = this.users.updateProfile(userId, patch);
    if (!updated) throw new NotFoundError('User', userId);
    return updated;
  }

  updateSettings(userId: string, settings: Partial<UserSettings>): User {
    const current = this.users.findById(userId);
    if (!current) throw new NotFoundError('User', userId);
    const merged: UserSettings = { ...DEFAULT_USER_SETTINGS, ...current.settings, ...settings };
    const updated = this.users.updateSettings(userId, merged);
    if (!updated) throw new NotFoundError('User', userId);
    return updated;
  }

  createUser(
    actor: User,
    input: { name: string; email: string; password: string; role: User['role']; avatarColor?: string }
  ): User {
    if (actor.role !== 'admin') throw new AppError('Admin only', 403, 'FORBIDDEN');
    if (input.password.length < 8) throw new ValidationError('Password must be at least 8 characters');
    if (this.users.findByEmail(input.email)) throw new ValidationError('Email already in use');

    return this.createMemberUser({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      avatarColor: input.avatarColor,
    });
  }

  private signToken(user: User): string {
    return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
  }
}
