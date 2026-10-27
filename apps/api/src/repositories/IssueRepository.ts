import type Database from 'better-sqlite3';
import type {
  CreateIssueInput,
  Issue,
  IssueFilters,
  IssueWithRelations,
  UpdateIssueInput,
  User,
  Project,
} from '../domain/types.js';

type IssueRow = {
  id: string;
  project_id: string;
  key: string;
  title: string;
  description: string;
  type: Issue['type'];
  status: Issue['status'];
  priority: Issue['priority'];
  severity: Issue['severity'];
  assignee_id: string | null;
  reporter_id: string;
  labels: string;
  story_points: number | null;
  due_date: string | null;
  environment: string | null;
  steps_to_reproduce: string | null;
  created_at: string;
  updated_at: string;
};

function mapIssue(r: IssueRow): Issue {
  return {
    id: r.id,
    projectId: r.project_id,
    key: r.key,
    title: r.title,
    description: r.description,
    type: r.type,
    status: r.status,
    priority: r.priority,
    severity: r.severity,
    assigneeId: r.assignee_id,
    reporterId: r.reporter_id,
    labels: JSON.parse(r.labels) as string[],
    storyPoints: r.story_points,
    dueDate: r.due_date,
    environment: r.environment,
    stepsToReproduce: r.steps_to_reproduce,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class IssueRepository {
  constructor(private readonly db: Database.Database) {}

  findMany(filters: IssueFilters): Issue[] {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filters.projectId) {
      clauses.push('project_id = ?');
      params.push(filters.projectId);
    }
    if (filters.status) {
      clauses.push('status = ?');
      params.push(filters.status);
    }
    if (filters.assigneeId) {
      clauses.push('assignee_id = ?');
      params.push(filters.assigneeId);
    }
    if (filters.type) {
      clauses.push('type = ?');
      params.push(filters.type);
    }
    if (filters.priority) {
      clauses.push('priority = ?');
      params.push(filters.priority);
    }
    if (filters.search) {
      clauses.push('(title LIKE ? OR key LIKE ? OR description LIKE ?)');
      const q = `%${filters.search}%`;
      params.push(q, q, q);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = this.db
      .prepare(`SELECT * FROM issues ${where} ORDER BY updated_at DESC`)
      .all(...params) as IssueRow[];
    return rows.map(mapIssue);
  }

  findById(id: string): Issue | null {
    const row = this.db.prepare('SELECT * FROM issues WHERE id = ?').get(id) as IssueRow | undefined;
    return row ? mapIssue(row) : null;
  }

  countByProject(projectId: string): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as c FROM issues WHERE project_id = ?')
      .get(projectId) as { c: number };
    return row.c;
  }

  insert(issue: Issue): void {
    this.db
      .prepare(
        `INSERT INTO issues (
      id, project_id, key, title, description, type, status, priority, severity,
      assignee_id, reporter_id, labels, story_points, due_date, environment,
      steps_to_reproduce, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        issue.id,
        issue.projectId,
        issue.key,
        issue.title,
        issue.description,
        issue.type,
        issue.status,
        issue.priority,
        issue.severity,
        issue.assigneeId,
        issue.reporterId,
        JSON.stringify(issue.labels),
        issue.storyPoints,
        issue.dueDate,
        issue.environment,
        issue.stepsToReproduce,
        issue.createdAt,
        issue.updatedAt
      );
  }

  update(id: string, patch: UpdateIssueInput, updatedAt: string): Issue | null {
    const current = this.findById(id);
    if (!current) return null;

    const next: Issue = {
      ...current,
      ...patch,
      labels: patch.labels ?? current.labels,
      updatedAt,
    };

    this.db
      .prepare(
        `UPDATE issues SET
      title = ?, description = ?, type = ?, status = ?, priority = ?, severity = ?,
      assignee_id = ?, labels = ?, story_points = ?, due_date = ?, environment = ?,
      steps_to_reproduce = ?, updated_at = ?
      WHERE id = ?`
      )
      .run(
        next.title,
        next.description,
        next.type,
        next.status,
        next.priority,
        next.severity,
        next.assigneeId,
        JSON.stringify(next.labels),
        next.storyPoints,
        next.dueDate,
        next.environment,
        next.stepsToReproduce,
        next.updatedAt,
        id
      );
    return next;
  }

  enrich(issue: Issue, users: User[], projects: Project[]): IssueWithRelations {
    const assignee = issue.assigneeId ? users.find((u) => u.id === issue.assigneeId) ?? null : null;
    const reporter = users.find((u) => u.id === issue.reporterId)!;
    const project = projects.find((p) => p.id === issue.projectId)!;
    const commentCount = (
      this.db.prepare('SELECT COUNT(*) as c FROM comments WHERE issue_id = ?').get(issue.id) as {
        c: number;
      }
    ).c;
    return { ...issue, assignee, reporter, project, commentCount };
  }
}
