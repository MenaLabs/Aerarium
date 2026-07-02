import { useEffect, useState } from 'react';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { CurrencyPicker } from '@/shared/components/CurrencyPicker';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useT } from '@/shared/i18n';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import { weekdayOptions } from './shared';
import type { Currency, RecurFrequency, TxType } from '@/types';

interface RecurringRuleModalProps {
  open: boolean;
  onClose: () => void;
}

export function RecurringRuleModal({ open, onClose }: RecurringRuleModalProps) {
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const addRecurringRule = useStore((s) => s.addRecurringRule);
  const { t, locale } = useT();
  const { defaultCurrency } = useCurrency();

  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RecurFrequency>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [weekday, setWeekday] = useState('1');

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!open) return;
    setType('expense');
    setAmount('');
    setCurrency(defaultCurrency);
    setDescription('');
    setFrequency('monthly');
    setDayOfMonth('1');
    setWeekday('1');
    setAccountId(accounts[0]?.id ?? '');
  }, [open, accounts, defaultCurrency]);

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? '');
    }
  }, [type, filteredCategories, categoryId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0 || !categoryId || !accountId) return;
    addRecurringRule({
      type,
      amount: parsed,
      currency,
      categoryId,
      accountId,
      description,
      frequency,
      dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth, 10) : undefined,
      weekday: frequency === 'weekly' ? parseInt(weekday, 10) : undefined,
      active: true,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('budget_newRecurringTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              type === 'income' ? 'bg-[var(--green)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('common_income')}
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              type === 'expense' ? 'bg-[var(--red)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('common_expense')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('common_amount')}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
          <CurrencyPicker
            label={t('common_currency')}
            value={currency}
            onChange={(code) => setCurrency(code as Currency)}
          />
        </div>

        <Select
          label={t('common_category')}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={filteredCategories.map((c) => ({ value: c.id, label: categoryDisplayName(c, locale)! }))}
        />

        <Select
          label={t('common_account')}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
        />

        <Select
          label={t('budget_frequency')}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurFrequency)}
          options={[
            { value: 'monthly', label: t('budget_monthly') },
            { value: 'weekly', label: t('budget_weekly') },
          ]}
        />

        {frequency === 'monthly' ? (
          <Input
            label={t('budget_dayOfMonth')}
            type="number"
            min={1}
            max={28}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
          />
        ) : (
          <Select
            label={t('budget_weekday')}
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            options={weekdayOptions(t)}
          />
        )}

        <Input
          label={t('common_description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('common_optional')}
        />

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
