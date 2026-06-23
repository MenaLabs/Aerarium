import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  CreditCard,
  Wallet,
  PiggyBank,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  ArrowRightLeft,
} from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Modal } from '@/shared/components/Modal';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { useStore } from '@/store';
import { useToastStore } from '@/store/toastStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmount } from '@/shared/utils/currency';
import { PALETTE } from '@/shared/utils/palette';
import { useT, type TranslationKey } from '@/shared/i18n';
import { CurrencyPicker } from '@/shared/components/CurrencyPicker';
import { TransferForm } from './TransferForm';
import type { Account, AccountType, Currency } from '@/types';

const TYPE_ICON: Record<AccountType, typeof CreditCard> = {
  card: CreditCard,
  cash: Wallet,
  savings: PiggyBank,
};

const TYPE_LABEL_KEY: Record<AccountType, TranslationKey> = {
  card: 'accounts_card',
  cash: 'accounts_cash',
  savings: 'accounts_savings',
};

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  account?: Account;
}

function AccountModal({ open, onClose, account }: AccountModalProps) {
  const addAccount = useStore((s) => s.addAccount);
  const updateAccount = useStore((s) => s.updateAccount);
  const { t } = useT();
  const { defaultCurrency } = useCurrency();

  const [name, setName] = useState(account?.name ?? '');
  const [currency, setCurrency] = useState<Currency>(account?.currency ?? defaultCurrency);
  const [type, setType] = useState<AccountType>(account?.type ?? 'card');
  const [balance, setBalance] = useState(String(account?.balance ?? 0));
  const [color, setColor] = useState(account?.color ?? PALETTE[0]);

  // The modal stays mounted; re-seed all fields whenever it opens (for create)
  // or the edited account changes, otherwise stale values from the previous
  // edit leak into the next one.
  useEffect(() => {
    if (!open) return;
    setName(account?.name ?? '');
    setCurrency(account?.currency ?? defaultCurrency);
    setType(account?.type ?? 'card');
    setBalance(String(account?.balance ?? 0));
    setColor(account?.color ?? PALETTE[0]);
  }, [open, account, defaultCurrency]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedBalance = parseFloat(balance.replace(',', '.')) || 0;
    if (account) {
      updateAccount(account.id, { name, currency, type, balance: parsedBalance, color });
    } else {
      addAccount({ name, currency, type, balance: parsedBalance, color });
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={account ? t('accounts_editTitle') : t('accounts_newTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label={t('common_name')} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <CurrencyPicker
            label={t('common_currency')}
            value={currency}
            onChange={(code) => setCurrency(code as Currency)}
          />
          <Select
            label={t('common_type')}
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            options={[
              { value: 'card', label: t('accounts_card') },
              { value: 'cash', label: t('accounts_cash') },
              { value: 'savings', label: t('accounts_savings') },
            ]}
          />
        </div>
        <Input
          label={t('accounts_initialBalance')}
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">{t('common_color')}</span>
          <div className="flex gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-surface)] ring-white' : ''
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
          <Button type="submit">{t('common_save')}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function Accounts() {
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const transfers = useStore((s) => s.transfers);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const deleteTransfer = useStore((s) => s.deleteTransfer);
  const restoreTransfer = useStore((s) => s.restoreTransfer);
  const showToast = useToastStore((s) => s.show);
  const { toUAH, formatUAH, defaultCurrency } = useCurrency();
  const { t } = useT();

  const [modalOpen, setModalOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + toUAH(a.balance, a.currency), 0);

  function openCreate() {
    setEditingAccount(undefined);
    setModalOpen(true);
  }

  function openEdit(account: Account) {
    setEditingAccount(account);
    setModalOpen(true);
  }

  function handleDeleteTransfer(transfer: (typeof transfers)[number]) {
    deleteTransfer(transfer.id);
    showToast(t('accounts_transferDeletedToast'), () => restoreTransfer(transfer));
  }

  const recentTransfers = [...transfers]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg font-semibold">{t('accounts_title')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setTransferOpen(true)}>
            <span className="flex items-center gap-1.5">
              <ArrowRightLeft size={14} /> {t('accounts_transfer')}
            </span>
          </Button>
          <Button onClick={openCreate}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} /> {t('accounts_newAccount')}
            </span>
          </Button>
        </div>
      </div>

      <Card>
        <div className="text-xs text-[var(--text-2)] mb-1">{t('accounts_totalBalance')}</div>
        <div className="text-2xl font-semibold">{formatUAH(totalBalance)}</div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a) => {
          const Icon = TYPE_ICON[a.type];
          const income = transactions
            .filter((tx) => !tx.isPlanned && tx.accountId === a.id && tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
          const expense = transactions
            .filter((tx) => !tx.isPlanned && tx.accountId === a.id && tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

          return (
            <Card
              key={a.id}
              className="relative pl-4"
              style={{ borderLeftColor: a.color, borderLeftWidth: 4 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[var(--text-2)]">
                  <Icon size={16} />
                  <span className="text-sm">{t(TYPE_LABEL_KEY[a.type])}</span>
                </div>
                <span className="text-xs text-[var(--text-2)]">{a.currency}</span>
              </div>

              <div className="text-sm text-[var(--text-2)] mb-0.5">{a.name}</div>
              <div className="text-2xl font-semibold mb-3">
                {formatAmount(a.balance, a.currency)}
              </div>
              {a.currency !== defaultCurrency && (
                <div className="text-xs text-[var(--text-2)] -mt-2 mb-3 flex flex-col gap-0.5">
                  <span>≈ {formatUAH(toUAH(a.balance, a.currency))}</span>
                  <span>
                    1 {a.currency} = {formatUAH(toUAH(1, a.currency))}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs mb-2">
                <div>
                  <div className="text-[var(--green)] font-medium">
                    {formatAmount(income, a.currency, { sign: true })}
                  </div>
                  <div className="text-[var(--text-2)]">{t('accounts_income')}</div>
                </div>
                <div>
                  <div className="text-[var(--red)] font-medium">
                    {formatAmount(-expense, a.currency, { sign: true })}
                  </div>
                  <div className="text-[var(--text-2)]">{t('accounts_expense')}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 absolute bottom-3 right-3">
                {confirmingId === a.id ? (
                  <>
                    <button
                      onClick={() => {
                        deleteAccount(a.id);
                        setConfirmingId(null);
                      }}
                      className="text-[var(--green)] hover:opacity-80"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="text-[var(--text-2)] hover:opacity-80"
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openEdit(a)}
                      className="text-[var(--text-2)] hover:text-[var(--text-1)] transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmingId(a.id)}
                      className="text-[var(--text-2)] hover:text-[var(--red)] transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h3 className="text-sm font-medium mb-3">{t('accounts_transfers')}</h3>
        {recentTransfers.length === 0 ? (
          <div className="text-sm text-[var(--text-2)] text-center py-8">{t('accounts_noTransfers')}</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {recentTransfers.map((tr) => {
              const from = accounts.find((a) => a.id === tr.fromAccountId);
              const to = accounts.find((a) => a.id === tr.toAccountId);
              return (
                <div
                  key={tr.id}
                  className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-[var(--bg-hover)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-[var(--text-2)] w-10 flex-shrink-0">
                      {format(parseISO(tr.date), 'dd.MM')}
                    </span>
                    <span className="text-sm truncate">
                      {from?.name ?? '?'} <ArrowRightLeft size={11} className="inline mx-1" />{' '}
                      {to?.name ?? '?'}
                    </span>
                    {tr.description && (
                      <span className="text-xs text-[var(--text-2)] truncate">
                        {tr.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-[var(--text-1)]">
                      {formatAmount(tr.amount, from?.currency ?? defaultCurrency)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransfer(tr)}
                      className="text-[var(--text-2)] hover:text-[var(--red)] transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        account={editingAccount}
      />
      <TransferForm open={transferOpen} onClose={() => setTransferOpen(false)} />
    </div>
  );
}
