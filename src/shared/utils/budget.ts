import type { Budget, BudgetPeriod, ExpectedBudget } from '@/types';

// Nominal day-counts used to normalize any period to a daily rate. Months and
// years use average lengths so conversions between periods are stable.
export const NOMINAL_DAYS: Record<BudgetPeriod, number> = {
  day: 1,
  week: 7,
  month: 365.25 / 12, // ≈ 30.4375
  year: 365.25,
};

export function toDailyRate(amount: number, period: BudgetPeriod): number {
  return amount / NOMINAL_DAYS[period];
}

export function convertPeriod(amount: number, from: BudgetPeriod, to: BudgetPeriod): number {
  return toDailyRate(amount, from) * NOMINAL_DAYS[to];
}

// Inclusive number of days between two YYYY-MM-DD strings.
export function daysInRange(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00');
  const b = new Date(to + 'T00:00:00');
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}

function daysInMonth(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

// Expected budget for an arbitrary [from, to] range. Sums each overlapping
// calendar month's contribution: a month with an explicit override contributes
// at its own daily rate (override / its days), other days use the recurring
// profile's daily rate. Exact for a single overridden month, correct across
// multi-month ranges.
export function expectedBudgetForRange(
  profile: ExpectedBudget | undefined,
  overrides: Record<string, number>,
  from: string,
  to: string
): number {
  const baseDaily = profile ? toDailyRate(profile.amount, profile.period) : 0;
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  if (end < start) return 0;

  let total = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    // count days of this month that fall within the range
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const sliceEnd = monthEnd < end ? monthEnd : end;
    const days = Math.round((sliceEnd.getTime() - cursor.getTime()) / 86400000) + 1;
    const override = overrides[ym];
    const daily = override != null ? override / daysInMonth(ym) : baseDaily;
    total += daily * days;
    // jump to the first day of next month
    cursor.setFullYear(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    cursor.setHours(0, 0, 0, 0);
  }
  return total;
}

// Resolve a recurring category limit to the viewed range.
// - amount-based: per-period amount → daily rate → × range days
// - percent-based: share of the expected budget for the same range
export function resolveBudgetLimit(
  budget: Budget,
  expectedForRange: number,
  rangeDays: number
): number {
  if (budget.percent != null) return (budget.percent / 100) * expectedForRange;
  return toDailyRate(budget.amountUAH ?? 0, budget.period) * rangeDays;
}
