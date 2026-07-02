import { describe, it, expect } from 'vitest';
import { toUAH, fromUAH, convertCurrency, formatAmount } from './currency';

// rates are stored as "UAH per 1 unit of CODE"
const RATES = { USD: 40, EUR: 44, BTC: 4_000_000 };

describe('toUAH', () => {
  it('returns the amount unchanged for UAH', () => {
    expect(toUAH(100, 'UAH', RATES)).toBe(100);
  });

  it('multiplies by the stored rate', () => {
    expect(toUAH(2, 'USD', RATES)).toBe(80);
    expect(toUAH(0.5, 'BTC', RATES)).toBe(2_000_000);
  });

  it('falls back to rate 1 when the rate is missing', () => {
    expect(toUAH(7, 'XXX' as never, {})).toBe(7);
  });
});

describe('fromUAH', () => {
  it('returns the amount unchanged for UAH', () => {
    expect(fromUAH(100, 'UAH', RATES)).toBe(100);
  });

  it('divides by the stored rate', () => {
    expect(fromUAH(80, 'USD', RATES)).toBe(2);
  });

  it('is the inverse of toUAH', () => {
    expect(fromUAH(toUAH(123.45, 'EUR', RATES), 'EUR', RATES)).toBeCloseTo(123.45, 10);
  });
});

describe('convertCurrency', () => {
  it('returns the amount unchanged when currencies match', () => {
    expect(convertCurrency(55, 'USD', 'USD', RATES)).toBe(55);
  });

  it('converts through the UAH pivot', () => {
    // 11 USD = 440 UAH = 10 EUR
    expect(convertCurrency(11, 'USD', 'EUR', RATES)).toBeCloseTo(10, 10);
  });
});

describe('formatAmount', () => {
  it('formats with the currency symbol and uk-UA decimal comma', () => {
    expect(formatAmount(12.5, 'USD')).toBe('$12,50');
    expect(formatAmount(0, 'UAH')).toBe('₴0,00');
  });

  it('respects per-currency decimals', () => {
    expect(formatAmount(500.4, 'JPY')).toBe('¥500'); // 0 decimals
    expect(formatAmount(0.12345678, 'BTC')).toBe('₿0,12345678'); // 8 decimals
  });

  it('renders an explicit sign when requested', () => {
    expect(formatAmount(5, 'USD', { sign: true })).toBe('+$5,00');
    // negative sign is U+2212 MINUS SIGN, not a hyphen
    expect(formatAmount(-5, 'USD', { sign: true })).toBe('−$5,00');
  });

  it('uses the absolute value without the sign option', () => {
    expect(formatAmount(-12.5, 'USD')).toBe('$12,50');
  });
});
