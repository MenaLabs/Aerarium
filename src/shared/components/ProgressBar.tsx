interface ProgressBarProps {
  percent: number;
  colorOverride?: string;
}

export function ProgressBar({ percent, colorOverride }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color =
    colorOverride ??
    (percent > 100 ? 'var(--red)' : percent > 75 ? 'var(--amber)' : 'var(--green)');

  return (
    <div className="h-2 w-full rounded-full bg-[var(--bg-hover)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
