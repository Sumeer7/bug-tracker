type Tone = 'default' | 'bug' | 'priority' | 'status';

const toneClass: Record<Tone, string> = {
  default: 'bg-white/10 text-mist',
  bug: 'bg-pulse-coral/20 text-pulse-coral',
  priority: 'bg-pulse-amber/15 text-pulse-amber',
  status: 'bg-pulse-mint/15 text-pulse-mint',
};

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
