import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Download, Trash2, Pencil, FileText } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useStore } from '@/store';
import { useToastStore } from '@/store/toastStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmount } from '@/shared/utils/currency';
import { platform } from '@/shared/platform';
import { useT, type TranslationKey } from '@/shared/i18n';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import { TransactionForm } from './TransactionForm';
import type { Transaction, TxType } from '@/types';

type Tab = 'all' | 'income' | 'expense' | 'planned';

const TABS: { id: Tab; labelKey: TranslationKey }[] = [
  { id: 'all', labelKey: 'transactions_tabAll' },
  { id: 'income', labelKey: 'transactions_tabIncome' },
  { id: 'expense', labelKey: 'transactions_tabExpense' },
  { id: 'planned', labelKey: 'transactions_tabPlanned' },
];

export function Transactions() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const restoreTransaction = useStore((s) => s.restoreTransaction);
  const showToast = useToastStore((s) => s.show);
  const { toUAH, formatUAH, defaultCurrency } = useCurrency();
  const { t, locale } = useT();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [search, setSearch] = useState('');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function handleDelete(tx: Transaction) {
    deleteTransaction(tx.id);
    showToast(t('transactions_deletedToast'), () => restoreTransaction(tx));
  }

  const filtered = useMemo(() => {
    let list = transactions;
    if (dateFrom) list = list.filter((tx) => tx.date >= dateFrom);
    if (dateTo) list = list.filter((tx) => tx.date <= dateTo);
    if (tab === 'income') list = list.filter((tx) => tx.type === 'income' && !tx.isPlanned);
    else if (tab === 'expense') list = list.filter((tx) => tx.type === 'expense' && !tx.isPlanned);
    else if (tab === 'planned') list = list.filter((tx) => tx.isPlanned);
    if (categoryId) list = list.filter((tx) => tx.categoryId === categoryId);
    if (accountId) list = list.filter((tx) => tx.accountId === accountId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((tx) => tx.description.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [transactions, dateFrom, dateTo, tab, categoryId, accountId, search]);

  async function handleExportCSV() {
    await platform.exportCSV();
  }

  async function handleExportPDF() {
    const rows = filtered.map((tx) => {
      const category = categories.find((c) => c.id === tx.categoryId);
      const account = accounts.find((a) => a.id === tx.accountId);
      return {
        date: tx.date,
        category: categoryDisplayName(category, locale) ?? t('common_other'),
        account: account?.name ?? '',
        description: tx.description,
        amount: formatAmount(tx.type === 'income' ? tx.amount : -tx.amount, tx.currency, {
          sign: true,
        }),
      };
    });
    await platform.exportPDF({ title: t('transactions_pdfTitle'), rows });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">{t('transactions_title')}</h1>

      <Card className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
        <DateRangeFilter
          onChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
        />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">{t('transactions_type')}</span>
          <div className="flex gap-1">
            {TABS.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  tab === tabItem.id
                    ? 'bg-[var(--blue)] text-white'
                    : 'bg-[var(--bg-hover)] text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                {t(tabItem.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <Select
          label={t('common_category')}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={[
            { value: '', label: t('common_allCategories') },
            ...categories.map((c) => ({ value: c.id, label: categoryDisplayName(c, locale)! })),
          ]}
        />

        <Select
          label={t('common_account')}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={[
            { value: '', label: t('common_allAccounts') },
            ...accounts.map((a) => ({ value: a.id, label: a.name })),
          ]}
        />

        <Input
          label={t('common_search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('transactions_searchPlaceholder')}
        />

        <div className="sm:ml-auto flex items-center gap-2">
          <Button variant="ghost" onClick={handleExportCSV}>
            <span className="flex items-center gap-1.5">
              <Download size={14} /> {t('transactions_exportCsv')}
            </span>
          </Button>
          {platform.capabilities.pdfExport && (
            <Button variant="ghost" onClick={handleExportPDF}>
              <span className="flex items-center gap-1.5">
                <FileText size={14} /> {t('transactions_exportPdf')}
              </span>
            </Button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <div className="py-10 text-center text-[var(--text-2)]">{t('transactions_notFound')}</div>
        </Card>
      ) : (
        <div className="md:hidden flex flex-col gap-2">
          {filtered.map((tx) => {
            const category = categories.find((c) => c.id === tx.categoryId);
            const account = accounts.find((a) => a.id === tx.accountId);
            return (
              <Card key={tx.id} className="!p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category?.color ?? '#8b949e' }}
                    />
                    <span className="truncate font-medium">{categoryDisplayName(category, locale) ?? t('common_other')}</span>
                    {tx.isPlanned && <Badge tone="amber">{t('dashboard_planned')}</Badge>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`font-medium ${
                        tx.type === 'income' ? 'text-[var(--green)]' : 'text-[var(--red)]'
                      }`}
                    >
                      {formatAmount(tx.type === 'income' ? tx.amount : -tx.amount, tx.currency, {
                        sign: true,
                      })}
                    </div>
                    {tx.currency !== defaultCurrency && (
                      <div className="text-xs text-[var(--text-2)]">
                        ≈ {formatUAH(toUAH(tx.amount, tx.currency))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 mt-2 text-xs text-[var(--text-2)]">
                  <span className="truncate">
                    {format(parseISO(tx.date), 'dd.MM')} · {account?.name ?? ''}
                    {tx.description ? ` · ${tx.description}` : ''}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingTx(tx);
                        setFormOpen(true);
                      }}
                      className="text-[var(--text-2)] hover:text-[var(--text-1)] transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tx)}
                      className="text-[var(--text-2)] hover:text-[var(--red)] transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <Card className="hidden md:block p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--text-2)] border-b border-[var(--border)]">
                <th className="px-4 py-2 font-medium">{t('transactions_colDate')}</th>
                <th className="px-4 py-2 font-medium">{t('transactions_colCategory')}</th>
                <th className="px-4 py-2 font-medium">{t('transactions_colAccount')}</th>
                <th className="px-4 py-2 font-medium">{t('transactions_colDescription')}</th>
                <th className="px-4 py-2 font-medium text-right">{t('transactions_colAmount')}</th>
                <th className="px-4 py-2 font-medium text-right">{t('transactions_colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const category = categories.find((c) => c.id === tx.categoryId);
                const account = accounts.find((a) => a.id === tx.accountId);
                const signedType: TxType = tx.type;
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition"
                  >
                    <td className="px-4 py-2.5 text-[var(--text-2)]">
                      {format(parseISO(tx.date), 'dd.MM')}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category?.color ?? '#8b949e' }}
                        />
                        <span className="truncate">{categoryDisplayName(category, locale) ?? t('common_other')}</span>
                        {tx.isPlanned && <Badge tone="amber">{t('dashboard_planned')}</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text-2)]">{account?.name ?? ''}</td>
                    <td className="px-4 py-2.5 text-[var(--text-1)] max-w-[240px] truncate">
                      {tx.description}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div
                        className={`font-medium ${
                          signedType === 'income' ? 'text-[var(--green)]' : 'text-[var(--red)]'
                        }`}
                      >
                        {formatAmount(signedType === 'income' ? tx.amount : -tx.amount, tx.currency, {
                          sign: true,
                        })}
                      </div>
                      {tx.currency !== defaultCurrency && (
                        <div className="text-xs text-[var(--text-2)]">
                          ≈ {formatUAH(toUAH(tx.amount, tx.currency))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setFormOpen(true);
                          }}
                          className="text-[var(--text-2)] hover:text-[var(--text-1)] transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx)}
                          className="text-[var(--text-2)] hover:text-[var(--red)] transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTx(null);
        }}
        editTransaction={editingTx ?? undefined}
      />
    </div>
  );
}
