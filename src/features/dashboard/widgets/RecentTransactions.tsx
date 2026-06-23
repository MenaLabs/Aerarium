import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useStore } from '@/store';
import { formatAmount } from '@/shared/utils/currency';
import { useT } from '@/shared/i18n';
import { categoryDisplayName } from '@/shared/utils/categoryName';

export function RecentTransactions() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const setPage = useStore((s) => s.setPage);
  const { t, locale } = useT();

  const recent = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{t('dashboard_recentTransactions')}</h3>
        <button
          onClick={() => setPage('transactions')}
          className="text-xs text-[var(--blue)] hover:opacity-80"
        >
          {t('dashboard_allTransactions')}
        </button>
      </div>
      {recent.length === 0 ? (
        <div className="text-sm text-[var(--text-2)] text-center py-10">
          {t('dashboard_noTransactions')}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {recent.map((tx) => {
            const category = categories.find((c) => c.id === tx.categoryId);
            const account = accounts.find((a) => a.id === tx.accountId);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-1.5 rounded-lg hover:bg-[var(--bg-hover)] px-2 -mx-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category?.color ?? '#8b949e' }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm text-[var(--text-1)] truncate">
                      {tx.description || categoryDisplayName(category, locale) || t('dashboard_transactionFallback')}
                    </div>
                    <div className="text-[11px] text-[var(--text-2)]">
                      {tx.date} · {account?.name ?? ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tx.isPlanned && <Badge tone="amber">{t('dashboard_planned')}</Badge>}
                  <span
                    className={`text-sm font-medium ${
                      tx.type === 'income' ? 'text-[var(--green)]' : 'text-[var(--red)]'
                    }`}
                  >
                    {formatAmount(tx.type === 'income' ? tx.amount : -tx.amount, tx.currency, {
                      sign: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
