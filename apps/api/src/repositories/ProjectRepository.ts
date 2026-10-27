import type Database from 'better-sqlite3';
import type { Project } from '../domain/types.js';

type ProjectRow = {
  id: string;
  key: string;
  name: string;
  description: string;
  created_at: string;
};

function mapRow(r: ProjectRow): Project {
  return {
    id: r.id,
    key: r.key,
    name: r.name,
    description: r.description,
    createdAt: r.created_at,
  };
}

export class ProjectRepository {
  constructor(private readonly db: Database.Database) {}

  findAll(): Project[] {
    const rows = this.db.prepare('SELECT * FROM projects ORDER BY name').all() as ProjectRow[];
    return rows.map(mapRow);
  }

  findById(id: string): Project | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
    return row ? mapRow(row) : null;
  }
}
