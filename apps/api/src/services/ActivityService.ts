import type { ActivityEvent } from '../domain/activity.js';
import { FIELD_LABELS } from '../domain/activity.js';
import type { ActivityRepository } from '../repositories/ActivityRepository.js';
import type { UserRepository } from '../repositories/UserRepository.js';
import type { User } from '../domain/types.js';

export interface ActivityItem {
  id: string;
  issueId: string;
  action: ActivityEvent['action'];
  field: string | null;
  fieldLabel: string | null;
  oldValue: string | null;
  newValue: string | null;
  message: string | null;
  createdAt: string;
  actor: User;
}

export class ActivityService {
  constructor(
    private readonly activity: ActivityRepository,
    private readonly users: UserRepository
  ) {}

  listForIssue(issueId: string): ActivityItem[] {
    const userList = this.users.findAll();
    return this.activity.findByIssue(issueId).map((e) => {
      const actor = userList.find((u) => u.id === e.actorId);
      if (!actor) throw new Error(`Missing actor ${e.actorId}`);
      const fieldLabel =
        e.field && e.field in FIELD_LABELS
          ? FIELD_LABELS[e.field as keyof typeof FIELD_LABELS]
          : e.field;
      return {
        id: e.id,
        issueId: e.issueId,
        action: e.action,
        field: e.field,
        fieldLabel,
        oldValue: this.resolveDisplay(e.field, e.oldValue, userList),
        newValue: this.resolveDisplay(e.field, e.newValue, userList),
        message: e.message,
        createdAt: e.createdAt,
        actor,
      };
    });
  }

  private resolveDisplay(field: string | null, value: string | null, users: User[]): string | null {
    if (value == null || value === '') return null;
    if (field === 'assigneeId') {
      if (value === 'null' || value === 'unassigned') return 'Unassigned';
      const u = users.find((x) => x.id === value);
      return u ? u.name : value;
    }
    if (field === 'labels') {
      try {
        const arr = JSON.parse(value) as string[];
        return arr.length ? arr.join(', ') : 'None';
      } catch {
        return value;
      }
    }
    return value;
  }
}
