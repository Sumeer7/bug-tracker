import type Database from 'better-sqlite3';
import type { ActivityAction, ActivityEvent } from '../domain/activity.js';

type Row = {
  id: string;
  issue_id: string;
  actor_id: string;
  action: ActivityAction;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  message: string | null;
  created_at: string;
};

function map(r: Row): ActivityEvent {
  return {
    id: r.id,
    issueId: r.issue_id,
    actorId: r.actor_id,
    action: r.action,
    field: r.field,
    oldValue: r.old_value,
    newValue: r.new_value,
    message: r.message,
    createdAt: r.created_at,
  };
}

export class ActivityRepository {
  constructor(private readonly db: Database.Database) {}

  insert(event: ActivityEvent): void {
    this.db
      .prepare(
        `INSERT INTO activity_events (id, issue_id, actor_id, action, field, old_value, new_value, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        event.id,
        event.issueId,
        event.actorId,
        event.action,
        event.field,
        event.oldValue,
        event.newValue,
        event.message,
        event.createdAt
      );
  }

  findByIssue(issueId: string): ActivityEvent[] {
    const rows = this.db
      .prepare('SELECT * FROM activity_events WHERE issue_id = ? ORDER BY created_at DESC')
      .all(issueId) as Row[];
    return rows.map(map);
  }
}
