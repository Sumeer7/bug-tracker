import type { Issue, IssueStatus } from '../types';
import { BOARD_COLUMNS, STATUS_LABELS } from '../lib/labels';
import { IssueCard } from './IssueCard';

type Props = {
  issues: Issue[];
  compact?: boolean;
  onSelect: (issue: Issue) => void;
  onStatusChange: (issueId: string, status: IssueStatus) => void;
};

export function BoardView({ issues, compact, onSelect, onStatusChange }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {BOARD_COLUMNS.map((status) => {
        const column = issues.filter((i) => i.status === status);
        return (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col rounded-2xl border border-white/8 bg-ink-soft/80"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-3 py-3">
              <h3 className="font-display text-sm font-semibold">{STATUS_LABELS[status]}</h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-mist">{column.length}</span>
            </div>
            <div
              className="flex flex-1 flex-col gap-2 p-2 min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData('issueId');
                if (id) onStatusChange(id, status);
              }}
            >
              {column.map((issue) => (
                <div
                  key={issue.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('issueId', issue.id)}
                >
                  <IssueCard issue={issue} onClick={() => onSelect(issue)} compact={compact ?? true} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
