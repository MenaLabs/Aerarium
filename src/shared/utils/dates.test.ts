import { describe, it, expect } from 'vitest';
import {
  monthLabel,
  prevMonth,
  nextMonth,
  monthRange,
  addDays,
  monthBounds,
  yearBounds,
} from './dates';

describe('monthLabel', () => {
  it('renders localized month names', () => {
    expect(monthLabel('2026-07', 'uk')).toBe('Липень 2026');
    expect(monthLabel('2026-01', 'en')).toBe('January 2026');
  });
});

describe('prevMonth / nextMonth', () => {
  it('crosses year boundaries', () => {
    expect(prevMonth('2026-01')).toBe('2025-12');
    expect(nextMonth('2026-12')).toBe('2027-01');
  });

  it('stays within a year otherwise', () => {
    expect(prevMonth('2026-07')).toBe('2026-06');
    expect(nextMonth('2026-07')).toBe('2026-08');
  });
});

describe('monthRange', () => {
  it('returns the last N months ending at the given month, oldest first', () => {
    expect(monthRange(3, '2026-02')).toEqual(['2025-12', '2026-01', '2026-02']);
  });
});

describe('addDays', () => {
  it('crosses month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('handles leap years', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
  });

  it('crosses year boundaries', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
  });
});

describe('monthBounds', () => {
  it('returns the first and last day of the month', () => {
    expect(monthBounds('2026-07')).toEqual({ from: '2026-07-01', to: '2026-07-31' });
    expect(monthBounds('2026-06')).toEqual({ from: '2026-06-01', to: '2026-06-30' });
  });

  it('handles leap February', () => {
    expect(monthBounds('2024-02')).toEqual({ from: '2024-02-01', to: '2024-02-29' });
    expect(monthBounds('2025-02')).toEqual({ from: '2025-02-01', to: '2025-02-28' });
  });
});

describe('yearBounds', () => {
  it('covers the full calendar year', () => {
    expect(yearBounds(2026)).toEqual({ from: '2026-01-01', to: '2026-12-31' });
  });
});
