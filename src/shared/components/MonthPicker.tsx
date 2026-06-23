import { ChevronLeft, ChevronRight } from 'lucide-react';
import { currentMonth, monthLabel, nextMonth, prevMonth } from '@/shared/utils/dates';
import { useT } from '@/shared/i18n';

interface MonthPickerProps {
  label?: string;
  value: string; // YYYY-MM, or '' for "all months" when allowAll
  onChange: (value: string) => void;
  allowAll?: boolean;
}

export function MonthPicker({ label, value, onChange, allowAll }: MonthPickerProps) {
  const { t, locale } = useT();
  function shift(dir: 1 | -1) {
    const base = value || currentMonth();
    onChange(dir === 1 ? nextMonth(base) : prevMonth(base));
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-[var(--text-2)]">{label}</span>}
      <div className="flex items-center gap-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-1 py-1">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="text-[var(--text-2)] hover:text-[var(--text-1)] p-1.5"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm min-w-[110px] text-center select-none text-[var(--text-1)]">
          {value ? monthLabel(value, locale) : t('common_allMonths')}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="text-[var(--text-2)] hover:text-[var(--text-1)] p-1.5"
        >
          <ChevronRight size={14} />
        </button>
        {allowAll && value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-[var(--text-2)] hover:text-[var(--red)] px-1.5"
            title={t('common_showAllMonths')}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
