import type { Currency } from '@/types';
import { currencyDecimals, currencySymbol } from './currencies';

export function toUAH(
  amount: number,
  currency: Currency,
  rates: Record<string, number>
): number {
  if (currency === 'UAH') return amount;
  return amount * (rates[currency] ?? 1);
}

export function fromUAH(
  amountUAH: number,
  currency: Currency,
  rates: Record<string, number>
): number {
  if (currency === 'UAH') return amountUAH;
  return amountUAH / (rates[currency] ?? 1);
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<string, number>
): number {
  if (from === to) return amount;
  return fromUAH(toUAH(amount, from, rates), to, rates);
}

export function formatAmount(
  amount: number,
  currency: Currency,
  options?: { sign?: boolean }
): string {
  const sym = currencySymbol(currency);
  const decimals = currencyDecimals(currency);
  const abs = Math.abs(amount).toLocaleString('uk-UA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (options?.sign) return `${amount >= 0 ? '+' : '−'}${sym}${abs}`;
  return `${sym}${abs}`;
}
