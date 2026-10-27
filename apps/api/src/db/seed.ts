import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

export const DEMO_PASSWORD = 'welcome123';

export function seedIfEmpty(db: Database.Database): void {
  const row = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (row.c > 0) return;

  const now = new Date().toISOString();
  const users = [
    { id: randomUUID(), name: 'Ava Chen', email: 'ava@pulse.dev', color: '#f72585', role: 'admin' },
    { id: randomUUID(), name: 'Jordan Lee', email: 'jordan@pulse.dev', color: '#4cc9f0', role: 'member' },
    { id: randomUUID(), name: 'Sam Rivera', email: 'sam@pulse.dev', color: '#b8f397', role: 'member' },
    { id: randomUUID(), name: 'Mia Okonkwo', email: 'mia@pulse.dev', color: '#ffb347', role: 'viewer' },
  ];

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const insertUser = db.prepare(
    `INSERT INTO users (id, name, email, avatar_color, role, password_hash, settings_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const u of users) {
    insertUser.run(u.id, u.name, u.email, u.color, u.role, passwordHash, '{}', now);
  }

  const projectId = randomUUID();
  db.prepare(
    `INSERT INTO projects (id, key, name, description, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(projectId, 'PLS', 'Pulse Mobile', 'Consumer app — payments & onboarding', now);

  const reporter = users[0].id;
  const assignee = users[1].id;

  const issues = [
    {
      title: 'Checkout button unresponsive on Safari',
      type: 'bug',
      status: 'in_progress',
      priority: 'critical',
      severity: 'blocker',
      assignee,
      labels: ['safari', 'payments'],
      env: 'staging',
      steps: '1. Open cart\n2. Tap Pay\n3. Nothing happens',
    },
    {
      title: 'Add dark mode toggle to settings',
      type: 'story',
      status: 'todo',
      priority: 'medium',
      severity: 'minor',
      assignee: users[2].id,
      labels: ['ui'],
      env: null,
      steps: null,
    },
    {
      title: 'API returns 500 on empty search',
      type: 'bug',
      status: 'in_review',
      priority: 'high',
      severity: 'major',
      assignee: users[2].id,
      labels: ['api', 'search'],
      env: 'production',
      steps: 'GET /search?q=',
    },
    {
      title: 'Write regression suite for auth',
      type: 'task',
      status: 'backlog',
      priority: 'low',
      severity: 'trivial',
      assignee: null,
      labels: ['qa'],
      env: null,
      steps: null,
    },
    {
      title: 'Platform reliability initiative',
      type: 'epic',
      status: 'backlog',
      priority: 'high',
      severity: 'major',
      assignee: users[0].id,
      labels: ['infra'],
      env: null,
      steps: null,
    },
  ];

  const insertIssue = db.prepare(`
    INSERT INTO issues (
      id, project_id, key, title, description, type, status, priority, severity,
      assignee_id, reporter_id, labels, story_points, due_date, environment,
      steps_to_reproduce, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  issues.forEach((issue, i) => {
    const id = randomUUID();
    const key = `PLS-${i + 1}`;
    insertIssue.run(
      id,
      projectId,
      key,
      issue.title,
      `Sample description for ${issue.title}.`,
      issue.type,
      issue.status,
      issue.priority,
      issue.severity,
      issue.assignee,
      reporter,
      JSON.stringify(issue.labels),
      issue.type === 'story' ? 5 : null,
      null,
      issue.env,
      issue.steps,
      now,
      now
    );
  });
}
