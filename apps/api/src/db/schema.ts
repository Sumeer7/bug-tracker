export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_color TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','member','viewer')),
  password_hash TEXT NOT NULL DEFAULT '',
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK(type IN ('bug','task','story','epic')),
  status TEXT NOT NULL CHECK(status IN ('backlog','todo','in_progress','in_review','done','cancelled')),
  priority TEXT NOT NULL CHECK(priority IN ('lowest','low','medium','high','critical')),
  severity TEXT NOT NULL CHECK(severity IN ('trivial','minor','major','critical','blocker')),
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  labels TEXT NOT NULL DEFAULT '[]',
  story_points INTEGER,
  due_date TEXT,
  environment TEXT,
  steps_to_reproduce TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON issues(assignee_id);
CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK(action IN ('created','field_changed','commented')),
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  message TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_activity_issue ON activity_events(issue_id);
`;
