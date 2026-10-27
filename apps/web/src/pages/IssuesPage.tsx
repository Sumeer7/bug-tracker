import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Issue, IssueStatus, Project, User } from '../types';
import { BoardView } from '../components/BoardView';
import { ListView } from '../components/ListView';
import { CreateIssueModal } from '../components/CreateIssueModal';
import { IssueDetailPanel } from '../components/IssueDetailPanel';
import { AppShell } from '../components/AppShell';

type ViewMode = 'board' | 'list';

export function IssuesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [view, setView] = useState<ViewMode>('board');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [selected, setSelected] = useState<Issue | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = user!;
  const activeProject = projects[0];

  useEffect(() => {
    if (user?.settings?.defaultView) setView(user.settings.defaultView);
  }, [user?.settings?.defaultView]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [u, p, i] = await Promise.all([
        api.getUsers(),
        api.getProjects(),
        api.getIssues({
          ...(activeProject ? { projectId: activeProject.id } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(assigneeFilter ? { assigneeId: assigneeFilter } : {}),
          ...(search ? { search } : {}),
        }),
      ]);
      setUsers(u);
      setProjects(p);
      setIssues(i);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [activeProject?.id, statusFilter, assigneeFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const open = issues.filter((i) => i.status !== 'done' && i.status !== 'cancelled').length;
    const bugs = issues.filter((i) => i.type === 'bug').length;
    const critical = issues.filter((i) => i.priority === 'critical').length;
    return { open, bugs, critical };
  }, [issues]);

  async function handleCreate(payload: Record<string, unknown>) {
    const created = await api.createIssue({ ...payload, reporterId: currentUser.id });
    setIssues((prev) => [created, ...prev]);
  }

  async function handleStatusChange(issueId: string, status: IssueStatus) {
    const updated = await api.updateIssue(issueId, { status });
    setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)));
    if (selected?.id === issueId) setSelected(updated);
  }

  function handleUpdated(issue: Issue) {
    setIssues((prev) => prev.map((i) => (i.id === issue.id ? issue : i)));
    setSelected(issue);
  }

  return (
    <AppShell>
      <main className="flex flex-1 flex-col">
        <header className="border-b border-white/10 bg-ink-soft/60 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Issues</h1>
              <p className="text-sm text-mist">
                {stats.open} open · {stats.bugs} bugs · {stats.critical} critical
              </p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
              + New issue
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              className="field-input max-w-xs"
              placeholder="Search key or title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="field-input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
            <select className="field-input w-auto" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="">All assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="ml-auto flex rounded-lg border border-white/10 p-0.5">
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${view === 'board' ? 'bg-pulse-magenta/30 text-white' : 'text-mist'}`}
                onClick={() => setView('board')}
              >
                Board
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${view === 'list' ? 'bg-pulse-magenta/30 text-white' : 'text-mist'}`}
                onClick={() => setView('list')}
              >
                List
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          {error && <p className="mb-4 rounded-lg bg-pulse-coral/20 px-4 py-2 text-sm text-pulse-coral">{error}</p>}
          {loading ? (
            <p className="text-mist">Loading workspace…</p>
          ) : view === 'board' ? (
            <BoardView
              issues={issues}
              compact={user?.settings?.compactCards}
              onSelect={setSelected}
              onStatusChange={(id, s) => void handleStatusChange(id, s)}
            />
          ) : (
            <ListView issues={issues} onSelect={setSelected} />
          )}
        </div>
      </main>

      <IssueDetailPanel
        issue={selected}
        users={users}
        currentUserId={currentUser.id}
        onClose={() => setSelected(null)}
        onUpdated={handleUpdated}
      />

      {activeProject && (
        <CreateIssueModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          projects={projects}
          users={users}
          defaultProjectId={activeProject.id}
          reporterId={currentUser.id}
          onCreate={handleCreate}
        />
      )}
    </AppShell>
  );
}
