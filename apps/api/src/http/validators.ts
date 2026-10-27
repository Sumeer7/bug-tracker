import { z } from 'zod';

const issueType = z.enum(['bug', 'task', 'story', 'epic']);
const issueStatus = z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']);
const priority = z.enum(['lowest', 'low', 'medium', 'high', 'critical']);
const severity = z.enum(['trivial', 'minor', 'major', 'critical', 'blocker']);

export const createIssueSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  type: issueType.optional(),
  status: issueStatus.optional(),
  priority: priority.optional(),
  severity: severity.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  reporterId: z.string().uuid().optional(),
  labels: z.array(z.string().max(40)).max(20).optional(),
  storyPoints: z.number().int().min(0).max(100).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  environment: z.string().max(200).nullable().optional(),
  stepsToReproduce: z.string().max(5000).nullable().optional(),
});

export const updateIssueSchema = createIssueSchema
  .omit({ projectId: true, reporterId: true })
  .partial()
  .extend({ actorId: z.string().uuid().optional() });

export const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const issueQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: issueStatus.optional(),
  assigneeId: z.string().uuid().optional(),
  type: issueType.optional(),
  priority: priority.optional(),
  search: z.string().max(100).optional(),
});
