import { randomUUID } from 'node:crypto';
import type { CreateIssueInput, Issue, IssueFilters, IssueWithRelations, UpdateIssueInput } from '../domain/types.js';
import { NotFoundError, ValidationError } from '../domain/errors.js';
import type { IssueRepository } from '../repositories/IssueRepository.js';
import type { ProjectRepository } from '../repositories/ProjectRepository.js';
import type { UserRepository } from '../repositories/UserRepository.js';
import type { ActivityRepository } from '../repositories/ActivityRepository.js';
import { recordCreated, recordIssueChanges } from './issueAudit.js';

export type UpdateIssuePayload = UpdateIssueInput & { actorId: string };

export class IssueService {
  constructor(
    private readonly issues: IssueRepository,
    private readonly projects: ProjectRepository,
    private readonly users: UserRepository,
    private readonly activity: ActivityRepository
  ) {}

  list(filters: IssueFilters): IssueWithRelations[] {
    const users = this.users.findAll();
    const projectList = this.projects.findAll();
    return this.issues.findMany(filters).map((i) => this.issues.enrich(i, users, projectList));
  }

  getById(id: string): IssueWithRelations {
    const issue = this.issues.findById(id);
    if (!issue) throw new NotFoundError('Issue', id);
    const users = this.users.findAll();
    const projectList = this.projects.findAll();
    return this.issues.enrich(issue, users, projectList);
  }

  create(input: CreateIssueInput): IssueWithRelations {
    const project = this.projects.findById(input.projectId);
    if (!project) throw new NotFoundError('Project', input.projectId);
    const reporter = this.users.findById(input.reporterId);
    if (!reporter) throw new NotFoundError('User', input.reporterId);
    if (input.assigneeId) {
      const assignee = this.users.findById(input.assigneeId);
      if (!assignee) throw new NotFoundError('User', input.assigneeId);
    }

    const now = new Date().toISOString();
    const seq = this.issues.countByProject(input.projectId) + 1;
    const key = `${project.key}-${seq}`;
    const id = randomUUID();

    const issue = {
      id,
      projectId: input.projectId,
      key,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      type: input.type ?? 'bug',
      status: input.status ?? 'backlog',
      priority: input.priority ?? 'medium',
      severity: input.severity ?? 'minor',
      assigneeId: input.assigneeId ?? null,
      reporterId: input.reporterId,
      labels: input.labels ?? [],
      storyPoints: input.storyPoints ?? null,
      dueDate: input.dueDate ?? null,
      environment: input.environment ?? null,
      stepsToReproduce: input.stepsToReproduce ?? null,
      createdAt: now,
      updatedAt: now,
    };

    if (!issue.title) throw new ValidationError('Title is required');

    this.issues.insert(issue);
    recordCreated(this.activity, id, input.reporterId, now);
    return this.getById(id);
  }

  update(id: string, payload: UpdateIssuePayload): IssueWithRelations {
    const { actorId, ...input } = payload;
    const actor = this.users.findById(actorId);
    if (!actor) throw new NotFoundError('User', actorId);

    const before = this.issues.findById(id);
    if (!before) throw new NotFoundError('Issue', id);

    if (input.assigneeId) {
      const assignee = this.users.findById(input.assigneeId);
      if (!assignee) throw new NotFoundError('User', input.assigneeId);
    }

    const updatedAt = new Date().toISOString();
    recordIssueChanges(this.activity, before, input, actorId, updatedAt);

    const next = this.issues.update(id, input, updatedAt);
    if (!next) throw new NotFoundError('Issue', id);
    return this.getById(id);
  }
}
