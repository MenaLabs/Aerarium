import type {
  Account,
  Category,
  ChartWidget,
  Currency,
  Locale,
  RecurringRule,
  Transaction,
} from '@/types';
import { currentMonth, monthLabel, monthRange, nextMonth, prevMonth } from '@/shared/utils/dates';
import { categoryDisplayName } from '@/shared/utils/categoryName';

export interface ChartCtx {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  recurringRules: RecurringRule[];
  toUAH: (amount: number, currency: Currency) => number;
  locale: Locale;
  otherLabel: string;
}

const PERIOD_MONTHS: Record<ChartWidget['period'], number> = { month: 1, quarter: 3, year: 12 };

export function periodMonthsFor(widget: ChartWidget): string[] {
  return monthRange(PERIOD_MONTHS[widget.period], currentMonth());
}

function shortLabel(ym: string, locale: Locale): string {
  return monthLabel(ym, locale).split(' ')[0].slice(0, 3);
}

function matchesFilters(t: Transaction, widget: ChartWidget): boolean {
  if (widget.accountId && t.accountId !== widget.accountId) return false;
  if (widget.currency && t.currency !== widget.currency) return false;
  return true;
}

export function computeSingleSeries(widget: ChartWidget, ctx: ChartCtx) {
  const months = periodMonthsFor(widget);
  return months.map((ym) => {
    let value = 0;
    for (const t of ctx.transactions) {
      if (t.isPlanned || !t.date.startsWith(ym) || !matchesFilters(t, widget)) continue;
      if (widget.metric === 'singleCategoryTrend') {
        if (t.categoryId !== widget.categoryId) continue;
        value += ctx.toUAH(t.amount, t.currency);
      } else {
        value += ctx.toUAH(t.amount, t.currency) * (t.type === 'income' ? 1 : -1);
      }
    }
    return { month: ym, label: shortLabel(ym, ctx.locale), value };
  });
}

function countWeekdayOccurrences(ym: string, weekday: number): number {
  const [y, m] = ym.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  let count = 0;
  for (let d = 1; d <= days; d++) {
    if (new Date(y, m - 1, d).getDay() === weekday) count++;
  }
  return count;
}

// Forecasts the running total balance forward over `period` months.
// Start = current net balance across accounts. Each step adds the month's
// expected net flow:
//  - current month: remaining planned (not-yet-completed) transactions — these
//    already include recurring occurrences auto-generated for this month;
//  - future months: recurring rules projected by frequency, plus any manual
//    (non-recurring) planned transactions dated in that month.
// This avoids double-counting recurring items, since recurring-generated planned
// transactions only exist for the current month.
export function computeBalanceProjection(widget: ChartWidget, ctx: ChartCtx) {
  const horizon = PERIOD_MONTHS[widget.period];
  const months: string[] = [currentMonth()];
  for (let i = 0; i < horizon; i++) months.push(nextMonth(months[months.length - 1]));

  let running = ctx.accounts.reduce(
    (sum, a) => sum + (widget.accountId && a.id !== widget.accountId ? 0 : ctx.toUAH(a.balance, a.currency)),
    0
  );

  return months.map((ym, idx) => {
    let flow = 0;
    if (idx === 0) {
      for (const t of ctx.transactions) {
        if (!t.isPlanned || !t.date.startsWith(ym) || !matchesFilters(t, widget)) continue;
        flow += ctx.toUAH(t.amount, t.currency) * (t.type === 'income' ? 1 : -1);
      }
    } else {
      for (const r of ctx.recurringRules) {
        if (!r.active) continue;
        if (widget.accountId && r.accountId !== widget.accountId) continue;
        if (widget.currency && r.currency !== widget.currency) continue;
        const occ = r.frequency === 'monthly' ? 1 : countWeekdayOccurrences(ym, r.weekday ?? 0);
        flow += occ * ctx.toUAH(r.amount, r.currency) * (r.type === 'income' ? 1 : -1);
      }
      for (const t of ctx.transactions) {
        if (!t.isPlanned || t.recurringId || !t.date.startsWith(ym) || !matchesFilters(t, widget)) {
          continue;
        }
        flow += ctx.toUAH(t.amount, t.currency) * (t.type === 'income' ? 1 : -1);
      }
    }
    running += flow;
    return { month: ym, label: shortLabel(ym, ctx.locale), value: running };
  });
}

export function computeIncomeExpenseSeries(widget: ChartWidget, ctx: ChartCtx) {
  const months = periodMonthsFor(widget);
  return months.map((ym) => {
    let income = 0;
    let expense = 0;
    for (const t of ctx.transactions) {
      if (t.isPlanned || !t.date.startsWith(ym) || !matchesFilters(t, widget)) continue;
      const uah = ctx.toUAH(t.amount, t.currency);
      if (t.type === 'income') income += uah;
      else expense += uah;
    }
    return { month: ym, label: shortLabel(ym, ctx.locale), income, expense };
  });
}

export function computeCategoryBreakdown(widget: ChartWidget, ctx: ChartCtx) {
  const months = periodMonthsFor(widget);
  const map = new Map<string, number>();
  for (const t of ctx.transactions) {
    if (
      t.isPlanned ||
      t.type !== 'expense' ||
      !months.includes(t.date.slice(0, 7)) ||
      !matchesFilters(t, widget)
    )
      continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + ctx.toUAH(t.amount, t.currency));
  }
  return Array.from(map.entries())
    .map(([categoryId, value]) => {
      const cat = ctx.categories.find((c) => c.id === categoryId);
      return { categoryId, name: categoryDisplayName(cat, ctx.locale) ?? ctx.otherLabel, color: cat?.color ?? '#8b949e', value };
    })
    .sort((a, b) => b.value - a.value);
}

export function computeCategoryCompare(widget: ChartWidget, ctx: ChartCtx) {
  const months = periodMonthsFor(widget);
  const previousBlock = monthRange(months.length, prevMonth(months[0]));

  function sumByCategory(monthList: string[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const t of ctx.transactions) {
      if (
        t.isPlanned ||
        t.type !== 'expense' ||
        !monthList.includes(t.date.slice(0, 7)) ||
        !matchesFilters(t, widget)
      )
        continue;
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + ctx.toUAH(t.amount, t.currency));
    }
    return map;
  }

  const current = sumByCategory(months);
  const previous = sumByCategory(previousBlock);
  const ids = new Set([...current.keys(), ...previous.keys()]);
  return Array.from(ids)
    .map((id) => {
      const cat = ctx.categories.find((c) => c.id === id);
      return {
        name: categoryDisplayName(cat, ctx.locale) ?? ctx.otherLabel,
        current: current.get(id) ?? 0,
        previous: previous.get(id) ?? 0,
      };
    })
    .filter((d) => d.current > 0 || d.previous > 0)
    .sort((a, b) => b.current - a.current);
}

export function computeTopCategories(widget: ChartWidget, ctx: ChartCtx) {
  const months = periodMonthsFor(widget);
  const map = new Map<string, number>();
  for (const t of ctx.transactions) {
    if (
      t.isPlanned ||
      t.type !== 'expense' ||
      !months.includes(t.date.slice(0, 7)) ||
      !matchesFilters(t, widget)
    )
      continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + ctx.toUAH(t.amount, t.currency));
  }
  const total = Array.from(map.values()).reduce((sum, v) => sum + v, 0);
  const rows = Array.from(map.entries())
    .map(([categoryId, value]) => {
      const cat = ctx.categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        name: categoryDisplayName(cat, ctx.locale) ?? ctx.otherLabel,
        color: cat?.color ?? '#8b949e',
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  return { rows, total };
}
