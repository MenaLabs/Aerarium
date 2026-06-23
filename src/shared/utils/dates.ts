import type { Locale } from '@/types';

export const MONTHS_UA = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

export const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function monthNames(locale: Locale): string[] {
  return locale === 'uk' ? MONTHS_UA : MONTHS_EN;
}

function parseYM(ym: string): { year: number; month: number } {
  const [year, month] = ym.split('-').map(Number);
  return { year, month };
}

export function monthLabel(ym: string, locale: Locale = 'en'): string {
  const { year, month } = parseYM(ym);
  return `${monthNames(locale)[month - 1]} ${year}`;
}

function shiftMonth(ym: string, delta: number): string {
  const { year, month } = parseYM(ym);
  const date = new Date(year, month - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function prevMonth(ym: string): string {
  return shiftMonth(ym, -1);
}

export function nextMonth(ym: string): string {
  return shiftMonth(ym, 1);
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function monthRange(count: number, endYm: string = currentMonth()): string[] {
  const months: string[] = [];
  let ym = endYm;
  for (let i = 0; i < count; i++) {
    months.unshift(ym);
    ym = prevMonth(ym);
  }
  return months;
}

export function uid(): string {
  return 'id_' + Date.now() + Math.random().toString(36).slice(2);
}

export function todayStr(): string {
  return formatDateYMD(new Date());
}

export function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + delta);
  return formatDateYMD(date);
}

export function monthBounds(ym: string): { from: string; to: string } {
  const { year, month } = parseYM(ym);
  const from = `${ym}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${ym}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

export function yearBounds(year: number): { from: string; to: string } {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

export function currentYear(): number {
  return new Date().getFullYear();
}
