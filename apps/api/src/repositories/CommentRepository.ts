import type Database from 'better-sqlite3';
import type { Comment } from '../domain/types.js';

type CommentRow = {
  id: string;
  issue_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

function mapRow(r: CommentRow): Comment {
  return {
    id: r.id,
    issueId: r.issue_id,
    authorId: r.author_id,
    body: r.body,
    createdAt: r.created_at,
  };
}

export class CommentRepository {
  constructor(private readonly db: Database.Database) {}

  findByIssue(issueId: string): Comment[] {
    const rows = this.db
      .prepare('SELECT * FROM comments WHERE issue_id = ? ORDER BY created_at ASC')
      .all(issueId) as CommentRow[];
    return rows.map(mapRow);
  }

  insert(comment: Comment): void {
    this.db
      .prepare(
        `INSERT INTO comments (id, issue_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)`
      )
      .run(comment.id, comment.issueId, comment.authorId, comment.body, comment.createdAt);
  }
}
