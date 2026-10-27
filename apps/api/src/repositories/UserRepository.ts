import type Database from 'better-sqlite3';
import type { User, UserSettings } from '../domain/types.js';
import { DEFAULT_USER_SETTINGS } from '../domain/types.js';

type UserRow = {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  role: User['role'];
  password_hash: string;
  settings_json: string;
  created_at: string;
};

function parseSettings(raw: string): UserSettings {
  try {
    const p = JSON.parse(raw) as Partial<UserSettings>;
    return { ...DEFAULT_USER_SETTINGS, ...p };
  } catch {
    return { ...DEFAULT_USER_SETTINGS };
  }
}

function mapRow(r: UserRow): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    avatarColor: r.avatar_color,
    role: r.role,
    settings: parseSettings(r.settings_json),
    createdAt: r.created_at,
  };
}

export class UserRepository {
  constructor(private readonly db: Database.Database) {}

  findAll(): User[] {
    const rows = this.db.prepare('SELECT * FROM users ORDER BY name').all() as UserRow[];
    return rows.map(mapRow);
  }

  findById(id: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    return row ? mapRow(row) : null;
  }

  findByEmail(email: string): User | null {
    const row = this.db
      .prepare('SELECT * FROM users WHERE lower(email) = lower(?)')
      .get(email.trim()) as UserRow | undefined;
    return row ? mapRow(row) : null;
  }

  getPasswordHash(userId: string): string | null {
    const row = this.db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as
      | { password_hash: string }
      | undefined;
    return row?.password_hash ?? null;
  }

  create(input: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    role: User['role'];
    passwordHash: string;
    createdAt: string;
  }): User {
    this.db
      .prepare(
        `INSERT INTO users (id, name, email, avatar_color, role, password_hash, settings_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.id,
        input.name,
        input.email.trim().toLowerCase(),
        input.avatarColor,
        input.role,
        input.passwordHash,
        JSON.stringify(DEFAULT_USER_SETTINGS),
        input.createdAt
      );
    return this.findById(input.id)!;
  }

  updateProfile(id: string, patch: { name?: string; avatarColor?: string }): User | null {
    const current = this.findById(id);
    if (!current) return null;
    const name = patch.name?.trim() ?? current.name;
    const avatarColor = patch.avatarColor ?? current.avatarColor;
    this.db
      .prepare('UPDATE users SET name = ?, avatar_color = ? WHERE id = ?')
      .run(name, avatarColor, id);
    return this.findById(id);
  }

  updatePasswordHash(id: string, passwordHash: string): void {
    this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
  }

  updateSettings(id: string, settings: UserSettings): User | null {
    this.db.prepare('UPDATE users SET settings_json = ? WHERE id = ?').run(JSON.stringify(settings), id);
    return this.findById(id);
  }
}
