import type Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'welcome123';

export function migrateUsersAuth(db: Database.Database): void {
  const cols = db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));

  if (!names.has('password_hash')) {
    db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''`);
  }
  if (!names.has('settings_json')) {
    db.exec(`ALTER TABLE users ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{}'`);
  }

  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  db.prepare(
    `UPDATE users SET password_hash = ? WHERE password_hash IS NULL OR password_hash = ''`
  ).run(hash);
}
