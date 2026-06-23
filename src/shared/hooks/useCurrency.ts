import { useStore } from '@/store';
import { toUAH, fromUAH, formatAmount } from '@/shared/utils/currency';
import type { Currency } from '@/types';

export function useCurrency() {
  const rates = useStore((s) => s.settings.rates);
  const defaultCurrency = useStore((s) => s.settings.defaultCurrency);

  return {
    rates,
    defaultCurrency,
    toUAH: (amount: number, currency: Currency) => toUAH(amount, currency, rates),
    fromUAH: (amountUAH: number) => fromUAH(amountUAH, defaultCurrency, rates),
    formatUAH: (amountUAH: number, options?: { sign?: boolean }) =>
      formatAmount(fromUAH(amountUAH, defaultCurrency, rates), defaultCurrency, options),
    formatAmount,
  };
}
