import type { ReactNode } from 'react';

type Tone = 'amber' | 'green' | 'red' | 'blue' | 'neutral';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

const TONE_CLASSES: Record<Tone, string> = {
  amber: 'bg-[var(--amber)]/15 text-[var(--amber)]',
  green: 'bg-[var(--green)]/15 text-[var(--green)]',
  red: 'bg-[var(--red)]/15 text-[var(--red)]',
  blue: 'bg-[var(--blue)]/15 text-[var(--blue)]',
  neutral: 'bg-[var(--text-2)]/15 text-[var(--text-2)]',
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
