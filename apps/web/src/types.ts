export type IssueType = 'bug' | 'task' | 'story' | 'epic';
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
export type Priority = 'lowest' | 'low' | 'medium' | 'high' | 'critical';
export type Severity = 'trivial' | 'minor' | 'major' | 'critical' | 'blocker';

export interface UserSettings {
  defaultView: 'board' | 'list';
  emailOnAssignment: boolean;
  compactCards: boolean;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: 'admin' | 'member' | 'viewer';
  settings: UserSettings;
  createdAt?: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
}

export interface Issue {
  id: string;
  projectId: string;
  key: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  severity: Severity;
  assigneeId: string | null;
  reporterId: string;
  labels: string[];
  storyPoints: number | null;
  dueDate: string | null;
  environment: string | null;
  stepsToReproduce: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: User | null;
  reporter: User;
  project: Project;
  commentCount: number;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author?: User | null;
}

export interface ActivityItem {
  id: string;
  issueId: string;
  action: 'created' | 'field_changed' | 'commented';
  field: string | null;
  fieldLabel: string | null;
  oldValue: string | null;
  newValue: string | null;
  message: string | null;
  createdAt: string;
  actor: User;
}
