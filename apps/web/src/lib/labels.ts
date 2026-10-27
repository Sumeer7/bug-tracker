import type { IssueStatus, IssueType, Priority, Severity } from '../types';

export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const TYPE_LABELS: Record<IssueType, string> = {
  bug: 'Bug',
  task: 'Task',
  story: 'Story',
  epic: 'Epic',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  lowest: 'Lowest',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  trivial: 'Trivial',
  minor: 'Minor',
  major: 'Major',
  critical: 'Critical',
  blocker: 'Blocker',
};

export const BOARD_COLUMNS: IssueStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
];
