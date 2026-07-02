import { describe, it, expect } from 'vitest';
import { csvEscape, buildCsv } from './csv';

describe('csvEscape', () => {
  it('passes plain values through unchanged', () => {
    expect(csvEscape('hello')).toBe('hello');
    expect(csvEscape('123.45')).toBe('123.45');
    expect(csvEscape('')).toBe('');
  });

  it('quotes values containing commas', () => {
    expect(csvEscape('a,b')).toBe('"a,b"');
  });

  it('quotes and doubles inner quotes', () => {
    expect(csvEscape('he said "hi"')).toBe('"he said ""hi"""');
  });

  it('quotes values containing newlines', () => {
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('buildCsv', () => {
  it('joins rows with commas and newlines, escaping as needed', () => {
    const csv = buildCsv([
      ['Date', 'Description', 'Amount'],
      ['2026-07-02', 'coffee, croissant', '4.50'],
    ]);
    expect(csv).toBe('Date,Description,Amount\n2026-07-02,"coffee, croissant",4.50');
  });
});
