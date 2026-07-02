import { monthBounds } from '@/shared/utils/dates';
import type { TranslationKey } from '@/shared/i18n';
import type { BudgetPeriod, RecurringRule } from '@/types';

export const PERIODS: BudgetPeriod[] = ['day', 'week', 'month', 'year'];

export const PERIOD_KEYS: Record<BudgetPeriod, TranslationKey> = {
  day: 'budget_period_day',
  week: 'budget_period_week',
  month: 'budget_period_month',
  year: 'budget_period_year',
};

const WEEKDAY_KEYS: TranslationKey[] = [
  'weekday_sun',
  'weekday_mon',
  'weekday_tue',
  'weekday_wed',
  'weekday_thu',
  'weekday_fri',
  'weekday_sat',
];

export function weekdayOptions(t: (key: TranslationKey) => string) {
  return [
    { value: '1', label: t('weekday_mon') },
    { value: '2', label: t('weekday_tue') },
    { value: '3', label: t('weekday_wed') },
    { value: '4', label: t('weekday_thu') },
    { value: '5', label: t('weekday_fri') },
    { value: '6', label: t('weekday_sat') },
    { value: '0', label: t('weekday_sun') },
  ];
}

export function frequencyLabel(
  rule: RecurringRule,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string {
  if (rule.frequency === 'monthly') {
    return t('budget_monthlyOn', { day: rule.dayOfMonth ?? 1 });
  }
  return t('budget_weeklyOn', { day: t(WEEKDAY_KEYS[rule.weekday ?? 0]) });
}

// If [from,to] is exactly one whole calendar month, return its "YYYY-MM".
export function singleMonthOf(from: string, to: string): string | null {
  const ym = from.slice(0, 7);
  const b = monthBounds(ym);
  return from === b.from && to === b.to ? ym : null;
}

export function periodPill(active: boolean): string {
  return `rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
    active ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
  }`;
}
