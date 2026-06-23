import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/components/Card';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useT } from '@/shared/i18n';
import { categoryDisplayName } from '@/shared/utils/categoryName';

interface ExpensePieChartProps {
  month: string;
}

export function ExpensePieChart({ month }: ExpensePieChartProps) {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const { toUAH, formatUAH } = useCurrency();
  const { t, locale } = useT();

  const expenseByCategory = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.isPlanned || tx.type !== 'expense' || !tx.date.startsWith(month)) continue;
    const uah = toUAH(tx.amount, tx.currency);
    expenseByCategory.set(tx.categoryId, (expenseByCategory.get(tx.categoryId) ?? 0) + uah);
  }

  const data = Array.from(expenseByCategory.entries())
    .map(([categoryId, value]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        name: categoryDisplayName(category, locale) ?? t('common_other'),
        color: category?.color ?? '#8b949e',
        value,
      };
    })
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <h3 className="text-sm font-medium mb-3">{t('dashboard_expensesByCategory')}</h3>
      {data.length === 0 ? (
        <div className="text-sm text-[var(--text-2)] text-center py-10">
          {t('dashboard_noExpensesThisMonth')}
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                {data.map((d) => (
                  <Cell key={d.categoryId} fill={d.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatUAH(value)}
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {data.map((d) => (
              <div key={d.categoryId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-[var(--text-1)] truncate">{d.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-2)] flex-shrink-0">
                  <span>{formatUAH(d.value)}</span>
                  <span>{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
