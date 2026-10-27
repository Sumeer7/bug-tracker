import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { IssueRepository } from '../repositories/IssueRepository.js';
import { CommentRepository } from '../repositories/CommentRepository.js';
import { ActivityRepository } from '../repositories/ActivityRepository.js';
import { IssueService } from '../services/IssueService.js';
import { ActivityService } from '../services/ActivityService.js';
import { NotFoundError } from '../domain/errors.js';
import { randomUUID } from 'node:crypto';
import { recordComment } from '../services/issueAudit.js';
import {
  createCommentSchema,
  createIssueSchema,
  issueQuerySchema,
  updateIssueSchema,
} from './validators.js';
import { createAuthRouter } from './authRoutes.js';
import type { AuthedRequest } from './authMiddleware.js';
import { requireAuth } from './authMiddleware.js';

function buildServices() {
  const db = getDb();
  const users = new UserRepository(db);
  const projects = new ProjectRepository(db);
  const issues = new IssueRepository(db);
  const comments = new CommentRepository(db);
  const activity = new ActivityRepository(db);
  const issueService = new IssueService(issues, projects, users, activity);
  const activityService = new ActivityService(activity, users);
  return { users, projects, issues, comments, activity, issueService, activityService };
}

export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'pulse-track-api' });
  });

  router.use('/auth', createAuthRouter());

  router.use(requireAuth);

  router.get('/users', (_req, res) => {
    const { users } = buildServices();
    res.json(users.findAll());
  });

  router.get('/projects', (_req, res) => {
    const { projects } = buildServices();
    res.json(projects.findAll());
  });

  router.get('/issues', (req, res, next) => {
    try {
      const filters = issueQuerySchema.parse(req.query);
      const { issueService } = buildServices();
      res.json(issueService.list(filters));
    } catch (e) {
      next(e);
    }
  });

  router.get('/issues/:id', (req, res, next) => {
    try {
      const { issueService } = buildServices();
      res.json(issueService.getById(String(req.params.id)));
    } catch (e) {
      next(e);
    }
  });

  router.post('/issues', (req: AuthedRequest, res, next) => {
    try {
      const body = createIssueSchema.parse(req.body);
      const reporterId = body.reporterId ?? req.user!.id;
      const { issueService } = buildServices();
      res.status(201).json(issueService.create({ ...body, reporterId }));
    } catch (e) {
      next(e);
    }
  });

  router.patch('/issues/:id', (req: AuthedRequest, res, next) => {
    try {
      const body = updateIssueSchema.parse(req.body);
      const actorId = body.actorId ?? req.user!.id;
      const { actorId: _drop, ...patch } = body;
      const { issueService } = buildServices();
      const id = String(req.params.id);
      res.json(issueService.update(id, { ...patch, actorId }));
    } catch (e) {
      next(e);
    }
  });

  router.get('/issues/:id/activity', (req, res, next) => {
    try {
      const { issues, activityService } = buildServices();
      const issueId = String(req.params.id);
      const issue = issues.findById(issueId);
      if (!issue) throw new NotFoundError('Issue', issueId);
      res.json(activityService.listForIssue(issue.id));
    } catch (e) {
      next(e);
    }
  });

  router.get('/issues/:id/comments', (req, res, next) => {
    try {
      const { issues, comments, users } = buildServices();
      const issueId = String(req.params.id);
      const issue = issues.findById(issueId);
      if (!issue) throw new NotFoundError('Issue', issueId);
      const list = comments.findByIssue(issue.id).map((c) => ({
        ...c,
        author: users.findById(c.authorId),
      }));
      res.json(list);
    } catch (e) {
      next(e);
    }
  });

  router.post('/issues/:id/comments', (req: AuthedRequest, res, next) => {
    try {
      const body = createCommentSchema.parse(req.body);
      const authorId = req.user!.id;
      const { issues, comments, users, activity } = buildServices();
      const issueId = String(req.params.id);
      const issue = issues.findById(issueId);
      if (!issue) throw new NotFoundError('Issue', issueId);
      const author = users.findById(authorId);
      if (!author) throw new NotFoundError('User', authorId);

      const createdAt = new Date().toISOString();
      const comment = {
        id: randomUUID(),
        issueId: issue.id,
        authorId,
        body: body.body.trim(),
        createdAt,
      };
      comments.insert(comment);
      recordComment(activity, issue.id, authorId, comment.body, createdAt);
      res.status(201).json({ ...comment, author });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
