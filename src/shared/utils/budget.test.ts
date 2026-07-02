import { describe, it, expect } from 'vitest';
import {
  NOMINAL_DAYS,
  toDailyRate,
  convertPeriod,
  daysInRange,
  expectedBudgetForRange,
  resolveBudgetLimit,
} from './budget';
import type { Budget } from '@/types';

describe('toDailyRate / convertPeriod', () => {
  it('normalizes each period by its nominal day count', () => {
    expect(toDailyRate(7, 'week')).toBe(1);
    expect(toDailyRate(NOMINAL_DAYS.month, 'month')).toBe(1);
  });

  it('converts month to year as exactly ×12', () => {
    expect(convertPeriod(100, 'month', 'year')).toBeCloseTo(1200, 10);
  });

  it('converts week to day as ÷7', () => {
    expect(convertPeriod(70, 'week', 'day')).toBeCloseTo(10, 10);
  });
});

describe('daysInRange', () => {
  it('is inclusive of both endpoints', () => {
    expect(daysInRange('2026-01-01', '2026-01-31')).toBe(31);
    expect(daysInRange('2026-07-02', '2026-07-02')).toBe(1);
  });

  it('returns 0 for a reversed range', () => {
    expect(daysInRange('2026-02-01', '2026-01-01')).toBe(0);
  });

  it('is not skewed by the DST clock change', () => {
    // Ukraine switches to summer time on the last Sunday of March
    expect(daysInRange('2026-03-28', '2026-03-30')).toBe(3);
  });

  it('handles leap February', () => {
    expect(daysInRange('2024-02-01', '2024-02-29')).toBe(29);
  });
});

describe('expectedBudgetForRange', () => {
  it('returns 0 without a profile or overrides', () => {
    expect(expectedBudgetForRange(undefined, {}, '2026-06-01', '2026-06-30')).toBe(0);
  });

  it('spreads a monthly profile over the actual days of the month', () => {
    const profile = { amount: NOMINAL_DAYS.month * 10, period: 'month' as const }; // daily = 10
    expect(expectedBudgetForRange(profile, {}, '2026-06-01', '2026-06-30')).toBeCloseTo(300, 8);
    expect(expectedBudgetForRange(profile, {}, '2026-07-01', '2026-07-31')).toBeCloseTo(310, 8);
  });

  it('uses the override amount exactly for a fully covered overridden month', () => {
    const profile = { amount: 1000, period: 'month' as const };
    const total = expectedBudgetForRange(profile, { '2026-06': 600 }, '2026-06-01', '2026-06-30');
    expect(total).toBeCloseTo(600, 8);
  });

  it('mixes overridden and profile months across a multi-month range', () => {
    const profile = { amount: NOMINAL_DAYS.month * 10, period: 'month' as const }; // daily = 10
    // May: 31 days × 10 = 310; June: override 600
    const total = expectedBudgetForRange(profile, { '2026-06': 600 }, '2026-05-01', '2026-06-30');
    expect(total).toBeCloseTo(910, 8);
  });

  it('prorates an override for a partial month', () => {
    // June override 600 over 30 days → 20/day; June 1–15 → 300
    const total = expectedBudgetForRange(undefined, { '2026-06': 600 }, '2026-06-01', '2026-06-15');
    expect(total).toBeCloseTo(300, 8);
  });

  it('returns 0 for a reversed range', () => {
    const profile = { amount: 1000, period: 'month' as const };
    expect(expectedBudgetForRange(profile, {}, '2026-06-30', '2026-06-01')).toBe(0);
  });
});

describe('resolveBudgetLimit', () => {
  it('resolves a percent-based limit as a share of the expected budget', () => {
    const budget: Budget = { id: 'b1', categoryId: 'c1', period: 'month', percent: 50 };
    expect(resolveBudgetLimit(budget, 200, 30)).toBe(100);
  });

  it('resolves an amount-based limit via the daily rate × range days', () => {
    const budget: Budget = { id: 'b1', categoryId: 'c1', period: 'week', amountUAH: 70 };
    expect(resolveBudgetLimit(budget, 0, 14)).toBeCloseTo(140, 10);
  });

  it('treats a missing amount as 0', () => {
    const budget: Budget = { id: 'b1', categoryId: 'c1', period: 'month' };
    expect(resolveBudgetLimit(budget, 0, 30)).toBe(0);
  });
});
