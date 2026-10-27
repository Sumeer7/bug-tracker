import { useState } from 'react';
import type { IssueType, Priority, Project, Severity, User } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  users: User[];
  defaultProjectId: string;
  reporterId: string;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
};

export function CreateIssueModal({
  open,
  onClose,
  projects,
  users,
  defaultProjectId,
  reporterId,
  onCreate,
}: Props) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [type, setType] = useState<IssueType>('bug');
  const [priority, setPriority] = useState<Priority>('medium');
  const [severity, setSeverity] = useState<Severity>('minor');
  const [assigneeId, setAssigneeId] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState('');
  const [steps, setSteps] = useState('');
  const [labels, setLabels] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onCreate({
        projectId,
        title,
        description,
        type,
        priority,
        severity,
        assigneeId: assigneeId || null,
        reporterId,
        environment: environment || null,
        stepsToReproduce: steps || null,
        labels: labels
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-ink-raised p-6 shadow-glow"
      >
        <h2 className="font-display text-xl font-bold">Create issue</h2>
        <p className="mt-1 text-sm text-mist">Capture bugs, tasks, stories, or epics.</p>

        <label className="mt-4 block text-xs font-medium text-mist">Title</label>
        <input className="field-input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-mist">Project</label>
            <select className="field-input mt-1" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-mist">Type</label>
            <select className="field-input mt-1" value={type} onChange={(e) => setType(e.target.value as IssueType)}>
              <option value="bug">Bug</option>
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="epic">Epic</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-mist">Priority</label>
            <select
              className="field-input mt-1"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="lowest">Lowest</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-mist">Severity</label>
            <select
              className="field-input mt-1"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
            >
              <option value="trivial">Trivial</option>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
              <option value="blocker">Blocker</option>
            </select>
          </div>
        </div>

        <label className="mt-3 block text-xs font-medium text-mist">Assignee</label>
        <select className="field-input mt-1" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <label className="mt-3 block text-xs font-medium text-mist">Description</label>
        <textarea className="field-input mt-1 min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />

        <label className="mt-3 block text-xs font-medium text-mist">Environment</label>
        <input className="field-input mt-1" value={environment} onChange={(e) => setEnvironment(e.target.value)} placeholder="staging, production…" />

        <label className="mt-3 block text-xs font-medium text-mist">Steps to reproduce</label>
        <textarea className="field-input mt-1 min-h-[60px]" value={steps} onChange={(e) => setSteps(e.target.value)} />

        <label className="mt-3 block text-xs font-medium text-mist">Labels (comma-separated)</label>
        <input className="field-input mt-1" value={labels} onChange={(e) => setLabels(e.target.value)} />

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
