import { useEffect, useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { DatePicker } from '@/shared/components/DatePicker';
import { Button } from '@/shared/components/Button';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { convertCurrency, formatAmount } from '@/shared/utils/currency';
import { useT } from '@/shared/i18n';

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransferForm({ open, onClose }: TransferFormProps) {
  const accounts = useStore((s) => s.accounts);
  const addTransfer = useStore((s) => s.addTransfer);
  const { rates } = useCurrency();
  const { t } = useT();

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setFromAccountId(accounts[0]?.id ?? '');
    setToAccountId(accounts[1]?.id ?? accounts[0]?.id ?? '');
    setAmount('');
    setDate(today());
    setDescription('');
  }, [open, accounts]);

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const toAmount =
    fromAccount && toAccount && !isNaN(parsedAmount)
      ? convertCurrency(parsedAmount, fromAccount.currency, toAccount.currency, rates)
      : 0;
  const isValid =
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    !!fromAccountId &&
    !!toAccountId &&
    fromAccountId !== toAccountId;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !fromAccount || !toAccount) return;
    addTransfer({
      fromAccountId,
      toAccountId,
      amount: parsedAmount,
      toAmount,
      date,
      description,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('accounts_transferTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label={t('accounts_from')}
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          options={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
        />

        <Select
          label={t('accounts_to')}
          value={toAccountId}
          onChange={(e) => setToAccountId(e.target.value)}
          options={accounts
            .filter((a) => a.id !== fromAccountId)
            .map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
        />

        {fromAccountId === toAccountId && (
          <div className="text-xs text-[var(--red)]">{t('accounts_mustDiffer')}</div>
        )}

        <Input
          label={t('accounts_amountIn', { currency: fromAccount?.currency ?? '' })}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          autoFocus
        />

        {fromAccount &&
          toAccount &&
          fromAccount.currency !== toAccount.currency &&
          !isNaN(parsedAmount) &&
          parsedAmount > 0 && (
            <div className="text-xs text-[var(--text-2)] -mt-2">
              {t('accounts_willCredit')} {formatAmount(toAmount, toAccount.currency)}
            </div>
          )}

        <DatePicker label={t('common_date')} value={date} onChange={setDate} />

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
          <Button type="submit" disabled={!isValid}>
            {t('accounts_transferBtn')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
