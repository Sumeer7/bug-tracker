type Props = { name: string; color: string; size?: 'sm' | 'md' };

export function Avatar({ name, color, size = 'md' }: Props) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const dim = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink ${dim}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </span>
  );
}
