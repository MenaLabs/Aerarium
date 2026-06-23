import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/shared/components/Card';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { monthRange, monthLabel } from '@/shared/utils/dates';
import { useT } from '@/shared/i18n';

interface MonthlyBarChartProps {
  month: string;
}

export function MonthlyBarChart({ month }: MonthlyBarChartProps) {
  const transactions = useStore((s) => s.transactions);
  const { toUAH, formatUAH } = useCurrency();
  const { t, locale } = useT();

  const months = monthRange(6, month);
  const data = months.map((ym) => {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.isPlanned || !tx.date.startsWith(ym)) continue;
      const uah = toUAH(tx.amount, tx.currency);
      if (tx.type === 'income') income += uah;
      else expense += uah;
    }
    return { month: ym, label: monthLabel(ym, locale).split(' ')[0].slice(0, 3), income, expense };
  });

  return (
    <Card>
      <h3 className="text-sm font-medium mb-3">{t('dashboard_last6Months')}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--text-2)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number) => formatUAH(value)}
            labelFormatter={(label: string, payload) =>
              payload?.[0] ? monthLabel(payload[0].payload.month, locale) : label
            }
            contentStyle={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="income" name={t('dashboard_incomeSeries')} fill="var(--green)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name={t('dashboard_expenseSeries')} fill="var(--red)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
