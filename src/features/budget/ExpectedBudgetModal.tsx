import { useEffect, useState } from 'react';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useT } from '@/shared/i18n';
import { formatAmount } from '@/shared/utils/currency';
import { convertPeriod } from '@/shared/utils/budget';
import { monthLabel } from '@/shared/utils/dates';
import { PERIODS, PERIOD_KEYS, periodPill } from './shared';
import type { BudgetPeriod } from '@/types';

type EntryPeriod = BudgetPeriod | 'custom';

interface ExpectedBudgetModalProps {
  open: boolean;
  onClose: () => void;
  overrideMonth: string | null; // when the current view is a single calendar month
}

export function ExpectedBudgetModal({ open, onClose, overrideMonth }: ExpectedBudgetModalProps) {
  const expectedBudget = useStore((s) => s.expectedBudget);
  const setExpectedBudget = useStore((s) => s.setExpectedBudget);
  const monthlyBudgets = useStore((s) => s.monthlyBudgets);
  const setMonthlyBudget = useStore((s) => s.setMonthlyBudget);
  const deleteMonthlyBudget = useStore((s) => s.deleteMonthlyBudget);
  const { t, locale } = useT();
  const { defaultCurrency, toUAH, fromUAH } = useCurrency();

  const [period, setPeriod] = useState<EntryPeriod>('month');
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('30');
  const [sync, setSync] = useState(true);
  const [override, setOverride] = useState('');

  useEffect(() => {
    if (!open) return;
    if (expectedBudget) {
      setPeriod(expectedBudget.period);
      setAmount(String(Number(fromUAH(expectedBudget.amount).toFixed(2))));
    } else {
      setPeriod('month');
      setAmount('');
    }
    setDays('30');
    setSync(true);
    const ov = overrideMonth ? monthlyBudgets[overrideMonth] : undefined;
    setOverride(ov != null ? String(Number(fromUAH(ov).toFixed(2))) : '');
  }, [open, overrideMonth, expectedBudget, monthlyBudgets, fromUAH]);

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const parsedDays = parseInt(days, 10);
  // amount per chosen period, expressed in the default currency
  const perPeriodAmount =
    period === 'custom'
      ? !isNaN(parsedAmount) && parsedDays > 0
        ? parsedAmount / parsedDays
        : NaN
      : parsedAmount;
  const equivPeriod: BudgetPeriod = period === 'custom' ? 'day' : period;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isNaN(perPeriodAmount) && perPeriodAmount > 0) {
      setExpectedBudget({ amount: toUAH(perPeriodAmount, defaultCurrency), period: equivPeriod });
    }
    if (overrideMonth) {
      const ov = parseFloat(override.replace(',', '.'));
      if (override.trim() === '' || isNaN(ov) || ov <= 0) {
        if (monthlyBudgets[overrideMonth] != null) deleteMonthlyBudget(overrideMonth);
      } else {
        setMonthlyBudget(overrideMonth, toUAH(ov, defaultCurrency));
      }
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('budget_expectedBudgetTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-xs text-[var(--text-2)]">{t('budget_monthlyBudgetHint')}</p>

        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} className={periodPill(period === p)}>
              {t(PERIOD_KEYS[p])}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPeriod('custom')}
            className={periodPill(period === 'custom')}
          >
            {t('budget_custom')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('budget_amountUah', { currency: defaultCurrency })}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
          {period === 'custom' && (
            <Input
              label={t('budget_customDays')}
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-2)]">
          <input
            type="checkbox"
            checked={sync}
            onChange={(e) => setSync(e.target.checked)}
            className="accent-[var(--blue)]"
          />
          {t('budget_sync')}
        </label>

        {sync && !isNaN(perPeriodAmount) && perPeriodAmount > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-2)]">
            {PERIODS.map((p) => (
              <span key={p}>
                {formatAmount(convertPeriod(perPeriodAmount, equivPeriod, p), defaultCurrency)}/
                {t(PERIOD_KEYS[p]).toLowerCase()}
              </span>
            ))}
          </div>
        )}

        {overrideMonth && (
          <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-1">
            <span className="text-xs text-[var(--text-2)]">
              {t('budget_overrideForMonth', { month: monthLabel(overrideMonth, locale) })}
            </span>
            <Input
              inputMode="decimal"
              value={override}
              onChange={(e) => setOverride(e.target.value)}
              placeholder={t('budget_overridePlaceholder')}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common_cancel')}
          </Button>
          <Button type="submit">{t('common_save')}</Button>
        </div>
      </form>
    </Modal>
  );
}
