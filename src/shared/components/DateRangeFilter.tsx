import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { MonthPicker } from './MonthPicker';
import { useT } from '@/shared/i18n';
import {
  addDays,
  currentMonth,
  currentYear,
  monthBounds,
  todayStr,
  yearBounds,
} from '@/shared/utils/dates';

type Granularity = 'year' | 'month' | 'day';
type Mode = 'point' | 'range';

interface DateRangeFilterProps {
  onChange: (from: string, to: string) => void;
  // 'past' = presets end today (history, e.g. transactions);
  // 'future' = presets start today (planning, e.g. budget).
  presetDirection?: 'past' | 'future';
}

function YearPicker({ value, onChange }: { value: number; onChange: (year: number) => void }) {
  return (
    <div className="flex items-center gap-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-1 py-1">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="text-[var(--text-2)] hover:text-[var(--text-1)] p-1.5"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-sm min-w-[70px] text-center select-none text-[var(--text-1)]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="text-[var(--text-2)] hover:text-[var(--text-1)] p-1.5"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function pillClass(activePill: boolean): string {
  return `rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
    activePill ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
  }`;
}

export function DateRangeFilter({ onChange, presetDirection = 'past' }: DateRangeFilterProps) {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>('point');
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [year, setYear] = useState(currentYear());
  const [month, setMonth] = useState(currentMonth());
  const [day, setDay] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [active, setActive] = useState(false);

  // Default the view to the current month on mount (instead of "all months").
  useEffect(() => {
    const b = monthBounds(currentMonth());
    setActive(true);
    onChange(b.from, b.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyYear(y: number) {
    setYear(y);
    setActive(true);
    const b = yearBounds(y);
    onChange(b.from, b.to);
  }

  function applyMonth(ym: string) {
    setMonth(ym);
    if (!ym) {
      setActive(false);
      onChange('', '');
      return;
    }
    setActive(true);
    const b = monthBounds(ym);
    onChange(b.from, b.to);
  }

  function applyDay(d: string) {
    setDay(d);
    setActive(true);
    onChange(d, d);
  }

  function applyRangeFrom(d: string) {
    setRangeFrom(d);
    setActive(true);
    onChange(d, rangeTo || d);
  }

  function applyRangeTo(d: string) {
    setRangeTo(d);
    setActive(true);
    onChange(rangeFrom || d, d);
  }

  function applyPresetDays(days: number) {
    let from: string;
    let to: string;
    if (presetDirection === 'future') {
      from = todayStr();
      to = addDays(from, days);
    } else {
      to = todayStr();
      from = addDays(to, -days);
    }
    setRangeFrom(from);
    setRangeTo(to);
    setActive(true);
    onChange(from, to);
  }

  function clearAll() {
    setActive(false);
    setMonth('');
    setDay('');
    setRangeFrom('');
    setRangeTo('');
    onChange('', '');
  }

  function switchGranularity(g: Granularity) {
    setGranularity(g);
    if (g === 'year') {
      applyYear(year);
    } else if (g === 'month') {
      applyMonth(month || currentMonth());
    } else {
      applyDay(day || todayStr());
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => setMode('point')} className={pillClass(mode === 'point')}>
          {t('transactions_dateModePoint')}
        </button>
        <button type="button" onClick={() => setMode('range')} className={pillClass(mode === 'range')}>
          {t('transactions_dateModeRange')}
        </button>
        {active && (
          <button
            type="button"
            onClick={clearAll}
            title={t('common_showAllMonths')}
            className="text-[var(--text-2)] hover:text-[var(--red)] p-1.5"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {mode === 'point' ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => switchGranularity('year')}
              className={pillClass(granularity === 'year')}
            >
              {t('common_year')}
            </button>
            <button
              type="button"
              onClick={() => switchGranularity('month')}
              className={pillClass(granularity === 'month')}
            >
              {t('common_month')}
            </button>
            <button
              type="button"
              onClick={() => switchGranularity('day')}
              className={pillClass(granularity === 'day')}
            >
              {t('common_day')}
            </button>
          </div>
          {granularity === 'year' && <YearPicker value={year} onChange={applyYear} />}
          {granularity === 'month' && <MonthPicker value={month} onChange={applyMonth} allowAll />}
          {granularity === 'day' && <DatePicker value={day} onChange={applyDay} />}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <DatePicker label={t('common_from')} value={rangeFrom} onChange={applyRangeFrom} />
            <DatePicker label={t('common_to')} value={rangeTo} onChange={applyRangeTo} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button type="button" onClick={() => applyPresetDays(1)} className={pillClass(false)}>
              {t('transactions_preset1d')}
            </button>
            <button type="button" onClick={() => applyPresetDays(7)} className={pillClass(false)}>
              {t('transactions_preset7d')}
            </button>
            <button type="button" onClick={() => applyPresetDays(30)} className={pillClass(false)}>
              {t('transactions_preset30d')}
            </button>
            <button type="button" onClick={() => applyPresetDays(365)} className={pillClass(false)}>
              {t('transactions_preset1y')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
