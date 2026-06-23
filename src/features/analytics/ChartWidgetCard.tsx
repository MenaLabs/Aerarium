import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Settings2, X } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useT } from '@/shared/i18n';
import {
  computeCategoryBreakdown,
  computeCategoryCompare,
  computeIncomeExpenseSeries,
  computeSingleSeries,
  computeTopCategories,
} from './chartData';
import type { ChartWidget } from '@/types';

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
};

interface ChartWidgetCardProps {
  widget: ChartWidget;
  onEdit: () => void;
  onDelete: () => void;
}

function EmptyMsg({ text }: { text: string }) {
  return <div className="text-sm text-[var(--text-2)] text-center py-10">{text}</div>;
}

export function ChartWidgetCard({ widget, onEdit, onDelete }: ChartWidgetCardProps) {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const { toUAH, formatUAH } = useCurrency();
  const { t, locale } = useT();
  const ctx = { transactions, categories, toUAH, locale, otherLabel: t('common_other') };

  let body: React.ReactNode;

  if (widget.metric === 'balance' || widget.metric === 'singleCategoryTrend') {
    const data = computeSingleSeries(widget, ctx);
    body = (
      <ResponsiveContainer width="100%" height={240}>
        {widget.visual === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-2)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: number) => formatUAH(v)} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name={widget.title} fill="var(--blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-2)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: number) => formatUAH(v)} contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="value"
              name={widget.title}
              stroke="var(--blue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  } else if (widget.metric === 'incomeExpense') {
    const data = computeIncomeExpenseSeries(widget, ctx);
    body = (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--text-2)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v: number) => formatUAH(v)} contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name={t('common_income')} fill="var(--green)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name={t('common_expense')} fill="var(--red)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  } else if (widget.metric === 'categoryBreakdown') {
    const data = computeCategoryBreakdown(widget, ctx);
    body =
      data.length === 0 ? (
        <EmptyMsg text={t('analytics_noData')} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          {widget.visual === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => entry.name}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatUAH(v)} contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-2)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => formatUAH(v)} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" name={widget.title} radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      );
  } else if (widget.metric === 'categoryCompare') {
    const data = computeCategoryCompare(widget, ctx);
    body =
      data.length === 0 ? (
        <EmptyMsg text={t('analytics_noData')} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-2)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: number) => formatUAH(v)} contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="previous" name={t('analytics_previousPeriod')} fill="var(--text-3)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" name={t('analytics_currentPeriod')} fill="var(--blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
  } else {
    const { rows } = computeTopCategories(widget, ctx);
    body =
      rows.length === 0 ? (
        <EmptyMsg text={t('analytics_noData')} />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[var(--text-2)] border-b border-[var(--border)]">
              <th className="py-2 font-medium">{t('analytics_colCategory')}</th>
              <th className="py-2 font-medium text-right">{t('analytics_colAmount')}</th>
              <th className="py-2 font-medium text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.categoryId} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </div>
                </td>
                <td className="py-2 text-right">{formatUAH(r.value)}</td>
                <td className="py-2 text-right text-[var(--text-2)]">{Math.round(r.percent)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{widget.title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="text-[var(--text-2)] hover:text-[var(--text-1)] transition">
            <Settings2 size={14} />
          </button>
          <button onClick={onDelete} className="text-[var(--text-2)] hover:text-[var(--red)] transition">
            <X size={14} />
          </button>
        </div>
      </div>
      {body}
    </Card>
  );
}
