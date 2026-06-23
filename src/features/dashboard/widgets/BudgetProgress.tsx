import { Card } from '@/shared/components/Card';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { resolveBudgetLimit } from '@/shared/utils/budget';
import { useT } from '@/shared/i18n';
import { categoryDisplayName } from '@/shared/utils/categoryName';

interface BudgetProgressProps {
  month: string;
}

export function BudgetProgress({ month }: BudgetProgressProps) {
  const budgets = useStore((s) => s.budgets);
  const monthlyBudgets = useStore((s) => s.monthlyBudgets);
  const categories = useStore((s) => s.categories);
  const transactions = useStore((s) => s.transactions);
  const { toUAH, formatUAH } = useCurrency();
  const { t, locale } = useT();

  const monthBudgets = budgets.filter((b) => b.month === month).slice(0, 5);
  const expectedBudget = monthlyBudgets[month] ?? 0;

  const spentByCategory = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.isPlanned || tx.type !== 'expense' || !tx.date.startsWith(month)) continue;
    const uah = toUAH(tx.amount, tx.currency);
    spentByCategory.set(tx.categoryId, (spentByCategory.get(tx.categoryId) ?? 0) + uah);
  }

  return (
    <Card>
      <h3 className="text-sm font-medium mb-3">{t('dashboard_budgetByCategory')}</h3>
      {monthBudgets.length === 0 ? (
        <div className="text-sm text-[var(--text-2)] text-center py-10">
          {t('dashboard_noBudgetSet')}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {monthBudgets.map((b) => {
            const category = categories.find((c) => c.id === b.categoryId);
            const spent = spentByCategory.get(b.categoryId) ?? 0;
            const limit = resolveBudgetLimit(b, expectedBudget);
            const percent = limit > 0 ? (spent / limit) * 100 : 0;
            const over = percent > 100;
            return (
              <div key={b.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={over ? 'text-[var(--red)] font-medium' : 'text-[var(--text-1)]'}>
                    {categoryDisplayName(category, locale) ?? t('common_other')}
                  </span>
                  <span className={over ? 'text-[var(--red)]' : 'text-[var(--text-2)]'}>
                    {formatUAH(spent)} / {formatUAH(limit)}
                  </span>
                </div>
                <ProgressBar percent={percent} />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
