import type { Issue } from '../types';
import { Avatar } from './Avatar';
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '../lib/labels';

type Props = {
  issues: Issue[];
  onSelect: (issue: Issue) => void;
};

export function ListView({ issues, onSelect }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-ink-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-ink-raised text-xs uppercase tracking-wide text-mist-dim">
          <tr>
            <th className="px-4 py-3">Key</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              className="cursor-pointer border-b border-white/5 transition hover:bg-white/5"
              onClick={() => onSelect(issue)}
            >
              <td className="px-4 py-3 font-mono text-pulse-magenta">{issue.key}</td>
              <td className="px-4 py-3 font-medium">{issue.title}</td>
              <td className="px-4 py-3 text-mist">{TYPE_LABELS[issue.type]}</td>
              <td className="px-4 py-3 text-mist">{STATUS_LABELS[issue.status]}</td>
              <td className="px-4 py-3 text-mist">{PRIORITY_LABELS[issue.priority]}</td>
              <td className="px-4 py-3">
                {issue.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={issue.assignee.name} color={issue.assignee.avatarColor} size="sm" />
                    <span className="text-mist">{issue.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-mist-dim">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-mist-dim">{new Date(issue.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {issues.length === 0 && (
        <p className="p-8 text-center text-mist-dim">No issues match your filters.</p>
      )}
    </div>
  );
}
