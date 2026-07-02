import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useT } from '@/shared/i18n';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import { PERIODS, PERIOD_KEYS, periodPill } from './shared';
import type { BudgetPeriod } from '@/types';

type LimitMode = 'amount' | 'percent';

interface BudgetLimitModalProps {
  open: boolean;
  onClose: () => void;
}

export function BudgetLimitModal({ open, onClose }: BudgetLimitModalProps) {
  const categories = useStore((s) => s.categories);
  const setBudget = useStore((s) => s.setBudget);
  const setBudgetPercent = useStore((s) => s.setBudgetPercent);
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );
  const { t, locale } = useT();
  const { defaultCurrency } = useCurrency();

  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? '');
  const [mode, setMode] = useState<LimitMode>('amount');
  const [period, setPeriod] = useState<BudgetPeriod>('month');
  const [amount, setAmount] = useState('');
  const [percent, setPercent] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode('amount');
    setPeriod('month');
    setAmount('');
    setPercent('');
    setCategoryId(expenseCategories[0]?.id ?? '');
  }, [open, expenseCategories]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;
    if (mode === 'amount') {
      const parsed = parseFloat(amount.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) return;
      setBudget(categoryId, parsed, period);
    } else {
      const parsed = parseFloat(percent.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0 || parsed > 100) return;
      setBudgetPercent(categoryId, parsed, period);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('budget_setLimitTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label={t('common_category')}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={expenseCategories.map((c) => ({ value: c.id, label: categoryDisplayName(c, locale)! }))}
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('amount')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              mode === 'amount' ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('budget_amountUah', { currency: defaultCurrency })}
          </button>
          <button
            type="button"
            onClick={() => setMode('percent')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              mode === 'percent' ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('budget_percentOfExpenses')}
          </button>
        </div>

        {mode === 'amount' ? (
          <Input
            label={t('budget_amountUah', { currency: defaultCurrency })}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
        ) : (
          <Input
            label={t('budget_percentInput')}
            inputMode="decimal"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="20"
            autoFocus
          />
        )}

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">{t('budget_period')}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PERIODS.map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)} className={periodPill(period === p)}>
                {t(PERIOD_KEYS[p])}
              </button>
            ))}
          </div>
        </div>

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
