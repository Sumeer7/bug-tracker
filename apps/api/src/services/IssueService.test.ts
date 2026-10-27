import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../db/schema.js';
import { IssueRepository } from '../repositories/IssueRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { IssueService } from './IssueService.js';
import { ActivityRepository } from '../repositories/ActivityRepository.js';
import { randomUUID } from 'node:crypto';

describe('IssueService', () => {
  let db: Database.Database;
  let service: IssueService;
  let projectId: string;
  let reporterId: string;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);
    const now = new Date().toISOString();
    reporterId = randomUUID();
    projectId = randomUUID();
    db.prepare(
      `INSERT INTO users (id, name, email, avatar_color, role, password_hash, settings_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(reporterId, 'Test User', 'test@pulse.dev', '#f72585', 'admin', 'hash', '{}', now);
    db.prepare(
      `INSERT INTO projects (id, key, name, description, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(projectId, 'TST', 'Test Project', '', now);

    service = new IssueService(
      new IssueRepository(db),
      new ProjectRepository(db),
      new UserRepository(db),
      new ActivityRepository(db)
    );
  });

  afterEach(() => {
    db.close();
  });

  it('creates issue with sequential key', () => {
    const a = service.create({ projectId, title: 'First bug', reporterId });
    const b = service.create({ projectId, title: 'Second bug', reporterId });
    expect(a.key).toBe('TST-1');
    expect(b.key).toBe('TST-2');
    expect(a.status).toBe('backlog');
  });

  it('records history when fields change', () => {
    const issue = service.create({ projectId, title: 'Audit me', reporterId });
    service.update(issue.id, { actorId: reporterId, status: 'in_progress', priority: 'high' });
    const activity = new ActivityRepository(db).findByIssue(issue.id);
    expect(activity.some((e) => e.action === 'created')).toBe(true);
    expect(activity.some((e) => e.field === 'status' && e.newValue === 'in_progress')).toBe(true);
    expect(activity.some((e) => e.field === 'priority' && e.newValue === 'high')).toBe(true);
  });
});
