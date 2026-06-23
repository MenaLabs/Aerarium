import { lazy, Suspense, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { TransactionForm } from '@/features/transactions/TransactionForm';
import { monthLabel, prevMonth, nextMonth, currentMonth } from '@/shared/utils/dates';
import { useT } from '@/shared/i18n';
import { SummaryCards } from './widgets/SummaryCards';
import { RecentTransactions } from './widgets/RecentTransactions';
import { BudgetProgress } from './widgets/BudgetProgress';
import type { TxType } from '@/types';

// recharts (+ its dependency tree: d3-*, lodash, decimal.js-light) is ~600KB
// unminified — lazy-load the two chart widgets so it isn't part of the initial
// bundle needed to paint the dashboard's non-chart content.
const ExpensePieChart = lazy(() =>
  import('./widgets/ExpensePieChart').then((m) => ({ default: m.ExpensePieChart }))
);
const MonthlyBarChart = lazy(() =>
  import('./widgets/MonthlyBarChart').then((m) => ({ default: m.MonthlyBarChart }))
);

function ChartFallback() {
  const { t } = useT();
  return (
    <Card>
      <div className="h-48 flex items-center justify-center text-sm text-[var(--text-2)]">
        {t('loading')}
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { t, locale } = useT();
  const [month, setMonth] = useState(currentMonth());
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<TxType>('expense');

  function openForm(type: TxType) {
    setFormType(type);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMonth(prevMonth(month))}
            className="text-[var(--text-2)] hover:text-[var(--text-1)]"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold capitalize">{monthLabel(month, locale)}</h1>
          <button
            onClick={() => setMonth(nextMonth(month))}
            className="text-[var(--text-2)] hover:text-[var(--text-1)]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => openForm('income')}
            className="!bg-[var(--green)]"
          >
            <span className="flex items-center gap-1">
              <Plus size={14} /> {t('common_income')}
            </span>
          </Button>
          <Button onClick={() => openForm('expense')} variant="danger">
            <span className="flex items-center gap-1">
              <Plus size={14} /> {t('common_expense')}
            </span>
          </Button>
        </div>
      </div>

      <SummaryCards month={month} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Suspense fallback={<ChartFallback />}>
          <ExpensePieChart month={month} />
        </Suspense>
        <Suspense fallback={<ChartFallback />}>
          <MonthlyBarChart month={month} />
        </Suspense>
        <RecentTransactions />
        <BudgetProgress month={month} />
      </div>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialType={formType}
      />
    </div>
  );
}
