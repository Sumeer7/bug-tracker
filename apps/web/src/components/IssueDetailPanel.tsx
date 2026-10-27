import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ActivityItem, Issue, IssueStatus, IssueType, Priority, Severity, User } from '../types';
import { Avatar } from './Avatar';
import {
  PRIORITY_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from '../lib/labels';

type Props = {
  issue: Issue | null;
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onUpdated: (issue: Issue) => void;
};

export function IssueDetailPanel({ issue, users, currentUserId, onClose, onUpdated }: Props) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [stepsDraft, setStepsDraft] = useState('');
  const [envDraft, setEnvDraft] = useState('');
  const [labelsDraft, setLabelsDraft] = useState('');
  const [pointsDraft, setPointsDraft] = useState('');

  const loadActivity = useCallback(async (issueId: string) => {
    const items = await api.getActivity(issueId);
    setActivity(items);
  }, []);

  useEffect(() => {
    if (!issue) return;
    setTitleDraft(issue.title);
    setDescDraft(issue.description);
    setStepsDraft(issue.stepsToReproduce ?? '');
    setEnvDraft(issue.environment ?? '');
    setLabelsDraft(issue.labels.join(', '));
    setPointsDraft(issue.storyPoints != null ? String(issue.storyPoints) : '');
    void loadActivity(issue.id);
  }, [issue?.id, loadActivity]);

  useEffect(() => {
    if (!issue) return;
    setTitleDraft(issue.title);
    setDescDraft(issue.description);
    setStepsDraft(issue.stepsToReproduce ?? '');
    setEnvDraft(issue.environment ?? '');
    setLabelsDraft(issue.labels.join(', '));
    setPointsDraft(issue.storyPoints != null ? String(issue.storyPoints) : '');
  }, [issue]);

  if (!issue) return null;
  const current = issue;

  async function patch(fields: Record<string, unknown>) {
    setSaving(true);
    try {
      const updated = await api.updateIssue(current.id, fields);
      onUpdated(updated);
      await loadActivity(current.id);
    } finally {
      setSaving(false);
    }
  }

  async function postComment() {
    if (!commentText.trim()) return;
    await api.addComment(current.id, { body: commentText.trim() });
    setCommentText('');
    await loadActivity(current.id);
  }

  const created = formatWhen(current.createdAt);
  const updated = formatWhen(current.updatedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/75 p-0 backdrop-blur-sm md:p-4">
      <div className="flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-none border border-white/10 bg-ink-soft shadow-glow md:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="truncate text-xs text-mist">
              <span className="text-pulse-magenta">{current.project.name}</span>
              <span className="mx-2 text-mist-dim">/</span>
              <span className="font-mono">{current.key}</span>
            </p>
          </div>
          <button type="button" className="btn-ghost shrink-0" onClick={onClose}>✕ Close</button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Main — ClickUp-style left column */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-b border-white/10 lg:border-b-0 lg:border-r">
            <div className="border-b border-white/8 px-4 py-4 md:px-6">
              <input
                className="w-full bg-transparent font-display text-2xl font-bold text-white outline-none placeholder:text-mist-dim"
                value={titleDraft}
                disabled={saving}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => {
                  if (titleDraft.trim() && titleDraft !== current.title) {
                    void patch({ title: titleDraft.trim() });
                  }
                }}
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-mist">
                <MetaPill label="Created" value={created} />
                <MetaPill label="Updated" value={updated} />
                <MetaPill label="Priority" value={PRIORITY_LABELS[current.priority]} accent />
                <MetaPill label="Status" value={STATUS_LABELS[current.status]} accent />
              </div>
            </div>

            <div className="space-y-6 px-4 py-5 md:px-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-mist-dim">Description</h3>
                <textarea
                  className="field-input mt-2 min-h-[140px] resize-y text-sm leading-relaxed"
                  value={descDraft}
                  disabled={saving}
                  placeholder="Add a description…"
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={() => {
                    if (descDraft !== current.description) void patch({ description: descDraft });
                  }}
                />
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-mist-dim">
                  Steps to reproduce
                </h3>
                <textarea
                  className="field-input mt-2 min-h-[100px] resize-y font-mono text-xs"
                  value={stepsDraft}
                  disabled={saving}
                  placeholder="1. …"
                  onChange={(e) => setStepsDraft(e.target.value)}
                  onBlur={() => {
                    const next = stepsDraft.trim() || null;
                    if (next !== current.stepsToReproduce) void patch({ stepsToReproduce: next });
                  }}
                />
              </section>

              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-mist-dim">Activity</h3>
                  <span className="text-[10px] text-mist-dim">{activity.length} events</span>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-ink-card/80 p-3">
                  <textarea
                    className="field-input min-h-[72px] resize-none text-sm"
                    placeholder="Write a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end">
                    <button type="button" className="btn-primary" onClick={() => void postComment()}>
                      Comment
                    </button>
                  </div>
                </div>
                <ul className="mt-4 space-y-3">
                  {activity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                  {activity.length === 0 && (
                    <p className="text-sm text-mist-dim">No activity yet.</p>
                  )}
                </ul>
              </section>
            </div>
          </div>

          {/* Right properties — ClickUp sidebar */}
          <aside className="w-full shrink-0 overflow-y-auto bg-ink-card/40 lg:w-[320px]">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-mist-dim">Task properties</p>
            </div>
            <div className="divide-y divide-white/8 text-sm">
              <PropRow label="Space">
                <span className="text-white">{current.project.name}</span>
              </PropRow>
              <PropRow label="Type">
                <select
                  className="field-input py-1.5 text-xs"
                  value={current.type}
                  disabled={saving}
                  onChange={(e) => void patch({ type: e.target.value as IssueType })}
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </PropRow>
              <PropRow label="Status">
                <select
                  className="field-input py-1.5 text-xs"
                  value={current.status}
                  disabled={saving}
                  onChange={(e) => void patch({ status: e.target.value as IssueStatus })}
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </PropRow>
              <PropRow label="Priority">
                <select
                  className="field-input py-1.5 text-xs"
                  value={current.priority}
                  disabled={saving}
                  onChange={(e) => void patch({ priority: e.target.value as Priority })}
                >
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </PropRow>
              <PropRow label="Severity">
                <select
                  className="field-input py-1.5 text-xs"
                  value={current.severity}
                  disabled={saving}
                  onChange={(e) => void patch({ severity: e.target.value as Severity })}
                >
                  {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </PropRow>
              <PropRow label="Assignee">
                <select
                  className="field-input py-1.5 text-xs"
                  value={current.assigneeId ?? ''}
                  disabled={saving}
                  onChange={(e) => void patch({ assigneeId: e.target.value || null })}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </PropRow>
              <PropRow label="Reporter">
                <div className="flex items-center gap-2">
                  <Avatar name={current.reporter.name} color={current.reporter.avatarColor} size="sm" />
                  <span className="text-mist">{current.reporter.name}</span>
                </div>
              </PropRow>
              <PropRow label="Date created">
                <span className="text-mist">{created}</span>
              </PropRow>
              <PropRow label="Date updated">
                <span className="text-mist">{updated}</span>
              </PropRow>
              <PropRow label="Due date">
                <input
                  type="date"
                  className="field-input py-1.5 text-xs"
                  value={current.dueDate?.slice(0, 10) ?? ''}
                  disabled={saving}
                  onChange={(e) =>
                    void patch({ dueDate: e.target.value ? `${e.target.value}T12:00:00.000Z` : null })
                  }
                />
              </PropRow>
              <PropRow label="Story points">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="field-input py-1.5 text-xs"
                  value={pointsDraft}
                  disabled={saving}
                  onChange={(e) => setPointsDraft(e.target.value)}
                  onBlur={() => {
                    const v = pointsDraft === '' ? null : Number(pointsDraft);
                    if (v !== current.storyPoints) void patch({ storyPoints: v });
                  }}
                />
              </PropRow>
              <PropRow label="Environment">
                <input
                  className="field-input py-1.5 text-xs"
                  value={envDraft}
                  disabled={saving}
                  placeholder="staging, prod…"
                  onChange={(e) => setEnvDraft(e.target.value)}
                  onBlur={() => {
                    const v = envDraft.trim() || null;
                    if (v !== current.environment) void patch({ environment: v });
                  }}
                />
              </PropRow>
              <PropRow label="Labels">
                <input
                  className="field-input py-1.5 text-xs"
                  value={labelsDraft}
                  disabled={saving}
                  placeholder="bug, regression"
                  onChange={(e) => setLabelsDraft(e.target.value)}
                  onBlur={() => {
                    const labels = labelsDraft
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    if (labels.join(',') !== current.labels.join(',')) void patch({ labels });
                  }}
                />
              </PropRow>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-4 py-2.5">
      <span className="text-xs text-mist-dim">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function MetaPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span>
      <span className="text-mist-dim">{label}: </span>
      <span className={accent ? 'font-medium text-pulse-amber' : 'text-mist'}>{value}</span>
    </span>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const when = formatWhen(item.createdAt);
  let body: React.ReactNode;
  if (item.action === 'created') {
    body = <span className="text-mist">created this task</span>;
  } else if (item.action === 'commented') {
    body = (
      <div>
        <span className="text-mist">commented</span>
        <p className="mt-1 rounded-lg bg-ink-soft px-3 py-2 text-sm text-white">{item.message}</p>
      </div>
    );
  } else {
    const old = formatFieldValue(item.field, item.oldValue);
    const neu = formatFieldValue(item.field, item.newValue);
    body = (
      <span className="text-mist">
        changed <strong className="text-white">{item.fieldLabel ?? item.field}</strong>
        {old != null && old !== '' && (
          <>
            {' '}from <span className="text-pulse-coral line-through">{old}</span>
          </>
        )}
        {neu != null && neu !== '' && (
          <>
            {' '}to <span className="text-pulse-mint">{neu}</span>
          </>
        )}
      </span>
    );
  }

  return (
    <li className="flex gap-3 border-l-2 border-pulse-magenta/30 pl-3">
      <Avatar name={item.actor.name} color={item.actor.avatarColor} size="sm" />
      <div className="min-w-0 flex-1 pb-1">
        <p className="text-xs">
          <span className="font-semibold text-white">{item.actor.name}</span>
          <span className="text-mist-dim"> · {when}</span>
        </p>
        <div className="mt-1 text-sm">{body}</div>
      </div>
    </li>
  );
}

function formatFieldValue(field: string | null, value: string | null) {
  if (value == null || value === '') return null;
  if (field === 'status' && value in STATUS_LABELS) return STATUS_LABELS[value as IssueStatus];
  if (field === 'priority' && value in PRIORITY_LABELS) return PRIORITY_LABELS[value as Priority];
  if (field === 'severity' && value in SEVERITY_LABELS) return SEVERITY_LABELS[value as Severity];
  if (field === 'type' && value in TYPE_LABELS) return TYPE_LABELS[value as IssueType];
  return value;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
