import { randomUUID } from 'node:crypto';
import type { ActivityEvent } from '../domain/activity.js';
import { TRACKED_ISSUE_FIELDS, type TrackedIssueField } from '../domain/activity.js';
import type { Issue, UpdateIssueInput } from '../domain/types.js';
import type { ActivityRepository } from '../repositories/ActivityRepository.js';

function serialize(field: TrackedIssueField, value: unknown): string {
  if (value === null || value === undefined) return '';
  if (field === 'labels') return JSON.stringify(value);
  if (field === 'assigneeId') return value ? String(value) : 'null';
  return String(value);
}

export function recordIssueChanges(
  repo: ActivityRepository,
  before: Issue,
  patch: UpdateIssueInput,
  actorId: string,
  updatedAt: string
): void {
  for (const field of TRACKED_ISSUE_FIELDS) {
    if (!(field in patch)) continue;
    const oldVal = before[field as keyof Issue];
    const newVal = patch[field as keyof UpdateIssueInput];
    if (serialize(field, oldVal) === serialize(field, newVal)) continue;

    const event: ActivityEvent = {
      id: randomUUID(),
      issueId: before.id,
      actorId,
      action: 'field_changed',
      field,
      oldValue: serialize(field, oldVal),
      newValue: serialize(field, newVal),
      message: null,
      createdAt: updatedAt,
    };
    repo.insert(event);
  }
}

export function recordCreated(
  repo: ActivityRepository,
  issueId: string,
  actorId: string,
  createdAt: string
): void {
  repo.insert({
    id: randomUUID(),
    issueId,
    actorId,
    action: 'created',
    field: null,
    oldValue: null,
    newValue: null,
    message: 'Created this task',
    createdAt,
  });
}

export function recordComment(
  repo: ActivityRepository,
  issueId: string,
  actorId: string,
  body: string,
  createdAt: string
): void {
  repo.insert({
    id: randomUUID(),
    issueId,
    actorId,
    action: 'commented',
    field: null,
    oldValue: null,
    newValue: null,
    message: body,
    createdAt,
  });
}
