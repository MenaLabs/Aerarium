import { useEffect, useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { DatePicker } from '@/shared/components/DatePicker';
import { Button } from '@/shared/components/Button';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { PALETTE } from '@/shared/utils/palette';
import { useT } from '@/shared/i18n';
import { CurrencyPicker } from '@/shared/components/CurrencyPicker';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import type { Currency, TxType, CategoryType, Transaction } from '@/types';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  initialType?: TxType;
  defaultPlanned?: boolean;
  editTransaction?: Transaction;
}

interface QuickCategoryModalProps {
  open: boolean;
  onClose: () => void;
  type: CategoryType;
  parentId: string;
  onCreated: (categoryId: string) => void;
}

function QuickCategoryModal({ open, onClose, type, parentId, onCreated }: QuickCategoryModalProps) {
  const addCategory = useStore((s) => s.addCategory);
  const { t } = useT();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);

  useEffect(() => {
    if (open) {
      setName('');
      setColor(PALETTE[0]);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const category = addCategory({ name: name.trim(), type, color, parentId });
    onCreated(category.id);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('txForm_newCategoryTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label={t('common_name')} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">{t('common_color')}</span>
          <div className="flex gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${
                  color === c
                    ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-surface)] ring-white'
                    : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common_cancel')}
          </Button>
          <Button type="submit">{t('txForm_saveAndSelect')}</Button>
        </div>
      </form>
    </Modal>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  open,
  onClose,
  initialType = 'expense',
  defaultPlanned = false,
  editTransaction,
}: TransactionFormProps) {
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const { toUAH, formatUAH, defaultCurrency } = useCurrency();
  const { t, locale } = useT();

  const [type, setType] = useState<TxType>(initialType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');
  const [isPlanned, setIsPlanned] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);
  const otherCategory = filteredCategories.find((c) => c.isOther);

  useEffect(() => {
    if (!open) return;
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setCurrency(editTransaction.currency);
      setCategoryId(editTransaction.categoryId);
      setAccountId(editTransaction.accountId);
      setDate(editTransaction.date);
      setDescription(editTransaction.description);
      setIsPlanned(editTransaction.isPlanned);
    } else {
      setType(initialType);
      setAmount('');
      setCurrency(defaultCurrency);
      setDate(today());
      setDescription('');
      setIsPlanned(defaultPlanned);
      setAccountId(accounts[0]?.id ?? '');
    }
  }, [open, initialType, defaultPlanned, accounts, editTransaction]);

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? '');
    }
  }, [type, filteredCategories, categoryId]);

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && categoryId && accountId && date;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const payload = { type, amount: parsedAmount, currency, categoryId, accountId, description, date, isPlanned };
    if (editTransaction) {
      updateTransaction(editTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editTransaction ? t('txForm_editTitle') : t('txForm_newTitle')}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              type === 'income'
                ? 'bg-[var(--green)] text-white'
                : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('common_income')}
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              type === 'expense'
                ? 'bg-[var(--red)] text-white'
                : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
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

        {currency !== defaultCurrency && !isNaN(parsedAmount) && parsedAmount > 0 && (
          <div className="text-xs text-[var(--text-2)] -mt-2">
            ≈ {formatUAH(toUAH(parsedAmount, currency))}
          </div>
        )}

        <Select
          label={t('common_category')}
          value={categoryId}
          onChange={(e) => {
            const value = e.target.value;
            setCategoryId(value);
            if (otherCategory && value === otherCategory.id) {
              setQuickAddOpen(true);
            }
          }}
          options={filteredCategories.map((c) => ({ value: c.id, label: categoryDisplayName(c, locale)! }))}
        />

        <Select
          label={t('common_account')}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
        />

        <DatePicker label={t('common_date')} value={date} onChange={setDate} />

        <Input
          label={t('common_description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('common_optional')}
        />

        <label className="flex items-center gap-2 text-sm text-[var(--text-2)]">
          <input
            type="checkbox"
            checked={isPlanned}
            onChange={(e) => setIsPlanned(e.target.checked)}
            className="accent-[var(--blue)]"
          />
          {t('txForm_planned')}
        </label>

        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common_cancel')}
          </Button>
          <Button type="submit" disabled={!isValid}>
            {t('common_save')}
          </Button>
        </div>
      </form>

      {otherCategory && (
        <QuickCategoryModal
          open={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          type={type}
          parentId={otherCategory.id}
          onCreated={(newId) => setCategoryId(newId)}
        />
      )}
    </Modal>
  );
}
