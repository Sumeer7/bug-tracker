export type ActivityAction = 'created' | 'field_changed' | 'commented';

export interface ActivityEvent {
  id: string;
  issueId: string;
  actorId: string;
  action: ActivityAction;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  message: string | null;
  createdAt: string;
}

export const TRACKED_ISSUE_FIELDS = [
  'title',
  'description',
  'type',
  'status',
  'priority',
  'severity',
  'assigneeId',
  'labels',
  'storyPoints',
  'dueDate',
  'environment',
  'stepsToReproduce',
] as const;

export type TrackedIssueField = (typeof TRACKED_ISSUE_FIELDS)[number];

export const FIELD_LABELS: Record<TrackedIssueField, string> = {
  title: 'Title',
  description: 'Description',
  type: 'Type',
  status: 'Status',
  priority: 'Priority',
  severity: 'Severity',
  assigneeId: 'Assignee',
  labels: 'Labels',
  storyPoints: 'Story points',
  dueDate: 'Due date',
  environment: 'Environment',
  stepsToReproduce: 'Steps to reproduce',
};
