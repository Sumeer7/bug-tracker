import type { Issue } from '../types';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { TYPE_LABELS, PRIORITY_LABELS } from '../lib/labels';

type Props = {
  issue: Issue;
  onClick: () => void;
  compact?: boolean;
};

export function IssueCard({ issue, onClick, compact }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-white/8 bg-ink-card p-3 text-left shadow-card transition hover:border-pulse-magenta/30 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] text-pulse-magenta">{issue.key}</span>
        <Badge tone={issue.type === 'bug' ? 'bug' : 'default'}>{TYPE_LABELS[issue.type]}</Badge>
      </div>
      <p className={`mt-1 font-display font-semibold leading-snug text-white ${compact ? 'text-sm' : ''}`}>
        {issue.title}
      </p>
      {!compact && (
        <p className="mt-1 line-clamp-2 text-xs text-mist-dim">{issue.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="priority">{PRIORITY_LABELS[issue.priority]}</Badge>
        {issue.labels.slice(0, 2).map((l) => (
          <span key={l} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist">
            {l}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        {issue.assignee ? (
          <Avatar name={issue.assignee.name} color={issue.assignee.avatarColor} size="sm" />
        ) : (
          <span className="text-[10px] text-mist-dim">Unassigned</span>
        )}
        {issue.storyPoints != null && (
          <span className="text-[10px] font-mono text-mist">{issue.storyPoints} pts</span>
        )}
      </div>
    </button>
  );
}
