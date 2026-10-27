import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCHEMA_SQL } from './schema.js';
import { seedIfEmpty } from './seed.js';
import { migrateUsersAuth } from './migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.PULSE_DB_PATH || path.join(__dirname, '../../../data/pulse.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(SCHEMA_SQL);
    migrateUsersAuth(db);
    seedIfEmpty(db);
  }
  return db;
}

export function closeDb(): void {
  db?.close();
  db = null;
}
