import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { monthNames } from '@/shared/utils/dates';
import { useT } from '@/shared/i18n';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

function parseDate(value: string): Date {
  if (!value) return new Date();
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  if (!value) return '';
  const d = parseDate(value);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const { t, locale } = useT();
  const WEEKDAYS = [
    t('weekday_short_mon'),
    t('weekday_short_tue'),
    t('weekday_short_wed'),
    t('weekday_short_thu'),
    t('weekday_short_fri'),
    t('weekday_short_sat'),
    t('weekday_short_sun'),
  ];
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseDate(value));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open) setViewDate(parseDate(value));
  }, [open, value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selected = value ? parseDate(value) : null;
  const today = new Date();

  function selectDay(d: number) {
    onChange(formatDate(new Date(year, month, d)));
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1 relative" ref={ref}>
      {label && <span className="text-xs text-[var(--text-2)]">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-[var(--bg-base)] border border-[var(--border)] focus:border-[var(--blue)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--text-1)] flex items-center justify-between gap-2"
      >
        <span>{formatDisplay(value) || t('common_chooseDate')}</span>
        <Calendar size={14} className="text-[var(--text-2)]" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 shadow-2xl w-64">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="text-[var(--text-2)] hover:text-[var(--text-1)] p-1"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium">
              {monthNames(locale)[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="text-[var(--text-2)] hover:text-[var(--text-1)] p-1"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[var(--text-2)] mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d == null) return <div key={i} />;
              const isSelected =
                !!selected &&
                selected.getFullYear() === year &&
                selected.getMonth() === month &&
                selected.getDate() === d;
              const isToday =
                today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={`text-xs rounded-lg py-1.5 transition ${
                    isSelected
                      ? 'bg-[var(--blue)] text-white'
                      : isToday
                        ? 'text-[var(--blue)] font-medium hover:bg-[var(--bg-hover)]'
                        : 'text-[var(--text-1)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(formatDate(today));
              setOpen(false);
            }}
            className="w-full mt-2 text-xs text-[var(--blue)] hover:opacity-80 py-1"
          >
            {t('common_today')}
          </button>
        </div>
      )}
    </div>
  );
}
