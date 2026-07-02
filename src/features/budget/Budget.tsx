import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Check, Trash2, Pencil, Pause, Play } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useStore } from '@/store';
import { useToastStore } from '@/store/toastStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmount } from '@/shared/utils/currency';
import {
  daysInRange,
  expectedBudgetForRange,
  resolveBudgetLimit,
} from '@/shared/utils/budget';
import { currentMonth, monthBounds, monthLabel } from '@/shared/utils/dates';
import { useT } from '@/shared/i18n';
import { TransactionForm } from '@/features/transactions/TransactionForm';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import { BudgetLimitModal } from './BudgetLimitModal';
import { ExpectedBudgetModal } from './ExpectedBudgetModal';
import { RecurringRuleModal } from './RecurringRuleModal';
import { PERIOD_KEYS, frequencyLabel, singleMonthOf } from './shared';
import type { Transaction } from '@/types';

export function Budget() {
  const defaultRange = monthBounds(currentMonth());
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);
  const [expectedModalOpen, setExpectedModalOpen] = useState(false);

  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const budgets = useStore((s) => s.budgets);
  const expectedBudgetProfile = useStore((s) => s.expectedBudget);
  const monthlyBudgets = useStore((s) => s.monthlyBudgets);
  const recurringRules = useStore((s) => s.recurringRules);
  const completeTransaction = useStore((s) => s.completeTransaction);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const restoreTransaction = useStore((s) => s.restoreTransaction);
  const deleteBudget = useStore((s) => s.deleteBudget);
  const deleteRecurringRule = useStore((s) => s.deleteRecurringRule);
  const toggleRecurringRule = useStore((s) => s.toggleRecurringRule);
  const showToast = useToastStore((s) => s.show);
  const { toUAH, formatUAH, defaultCurrency } = useCurrency();
  const { t, locale } = useT();

  function handleRangeChange(nextFrom: string, nextTo: string) {
    if (!nextFrom || !nextTo) {
      // budgets are inherently periodic — "all time" is meaningless, fall back to this month
      setFrom(defaultRange.from);
      setTo(defaultRange.to);
      return;
    }
    setFrom(nextFrom);
    setTo(nextTo);
  }

  function handleDeletePlanned(tx: Transaction) {
    deleteTransaction(tx.id);
    showToast(t('budget_deletedToast'), () => restoreTransaction(tx));
  }

  const overrideMonth = singleMonthOf(from, to);
  const rangeDays = daysInRange(from, to);
  const rangeLabel = overrideMonth
    ? monthLabel(overrideMonth, locale)
    : `${format(parseISO(from), 'dd.MM.yyyy')} – ${format(parseISO(to), 'dd.MM.yyyy')}`;

  const inRange = (date: string) => date >= from && date <= to;

  const plannedTx = transactions
    .filter((tx) => tx.isPlanned && inRange(tx.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  const expectedIncome = plannedTx
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + toUAH(tx.amount, tx.currency), 0);
  const expectedExpense = plannedTx
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + toUAH(tx.amount, tx.currency), 0);

  const spentByCategory = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.isPlanned || tx.type !== 'expense' || !inRange(tx.date)) continue;
    spentByCategory.set(
      tx.categoryId,
      (spentByCategory.get(tx.categoryId) ?? 0) + toUAH(tx.amount, tx.currency)
    );
  }
  const totalExpenses = Array.from(spentByCategory.values()).reduce((s, v) => s + v, 0);

  const expectedForRange = expectedBudgetForRange(
    expectedBudgetProfile ?? undefined,
    monthlyBudgets,
    from,
    to
  );
  const remaining = expectedForRange - totalExpenses;
  const overallPercent = expectedForRange > 0 ? (totalExpenses / expectedForRange) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <DateRangeFilter onChange={handleRangeChange} presetDirection="future" />
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" onClick={() => setFormOpen(true)}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} /> {t('budget_plannedBtn')}
            </span>
          </Button>
          <Button variant="ghost" onClick={() => setRecurringModalOpen(true)}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} /> {t('budget_recurringBtn')}
            </span>
          </Button>
          <Button onClick={() => setLimitModalOpen(true)}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} /> {t('budget_budgetBtn')}
            </span>
          </Button>
        </div>
      </div>

      <Card>
        {expectedForRange > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1 flex items-center gap-1.5">
                  {t('budget_expected')} · {rangeLabel}
                  <button
                    onClick={() => setExpectedModalOpen(true)}
                    className="text-[var(--text-2)] hover:text-[var(--text-1)] transition"
                    title={t('budget_expectedBudgetTitle')}
                  >
                    <Pencil size={12} />
                  </button>
                </div>
                <div className="text-lg font-semibold">{formatUAH(expectedForRange)}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">{t('budget_spent')}</div>
                <div className="text-lg font-semibold">{formatUAH(totalExpenses)}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-2)] mb-1">{t('budget_remaining')}</div>
                <div
                  className={`text-lg font-semibold ${
                    remaining >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
                  }`}
                >
                  {formatUAH(remaining, { sign: true })}
                </div>
              </div>
            </div>
            <ProgressBar percent={overallPercent} />
          </>
        ) : (
          <div className="flex flex-col items-start gap-2">
            <div className="text-sm font-medium">{t('budget_expectedBudgetTitle')}</div>
            <div className="text-xs text-[var(--text-2)]">{t('budget_monthlyBudgetHint')}</div>
            <Button onClick={() => setExpectedModalOpen(true)}>
              <span className="flex items-center gap-1.5">
                <Plus size={14} /> {t('budget_setExpectedBudget')}
              </span>
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-3">
          {t('budget_plannedTx')} — {rangeLabel}
        </h3>
        {plannedTx.length === 0 ? (
          <div className="text-sm text-[var(--text-2)] text-center py-8">{t('budget_noPlannedTx')}</div>
        ) : (
          <div className="flex flex-col gap-2 mb-3">
            {plannedTx.map((tx) => {
              const category = categories.find((c) => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-[var(--bg-hover)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-[var(--text-2)] w-10">
                      {format(parseISO(tx.date), 'dd.MM')}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category?.color ?? '#8b949e' }}
                    />
                    <span className="text-sm truncate">
                      {tx.description || categoryDisplayName(category, locale)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
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
                    <button
                      onClick={() => completeTransaction(tx.id)}
                      className="text-[var(--green)] hover:opacity-80"
                      title={t('budget_done')}
                    >
                      <Check size={14} />
                    </button>
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
                      onClick={() => handleDeletePlanned(tx)}
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
        <div className="flex items-center gap-4 text-xs text-[var(--text-2)] border-t border-[var(--border)] pt-3">
          <span>
            {t('budget_expectedIncome')}:{' '}
            <span className="text-[var(--green)] font-medium">{formatUAH(expectedIncome)}</span>
          </span>
          <span>
            {t('budget_expectedExpense')}:{' '}
            <span className="text-[var(--red)] font-medium">{formatUAH(expectedExpense)}</span>
          </span>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium mb-3">{t('budget_recurringTx')}</h3>
        {recurringRules.length === 0 ? (
          <div className="text-sm text-[var(--text-2)] text-center py-8">{t('budget_noRecurringTx')}</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {recurringRules.map((rule) => {
              const category = categories.find((c) => c.id === rule.categoryId);
              const account = accounts.find((a) => a.id === rule.accountId);
              return (
                <div
                  key={rule.id}
                  className={`flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-[var(--bg-hover)] ${
                    rule.active ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category?.color ?? '#8b949e' }}
                    />
                    <span className="text-sm truncate">
                      {rule.description || categoryDisplayName(category, locale)}
                    </span>
                    <span className="text-xs text-[var(--text-2)] flex-shrink-0">
                      {frequencyLabel(rule, t)} · {account?.name ?? ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-sm font-medium ${
                        rule.type === 'income' ? 'text-[var(--green)]' : 'text-[var(--red)]'
                      }`}
                    >
                      {formatAmount(rule.type === 'income' ? rule.amount : -rule.amount, rule.currency, {
                        sign: true,
                      })}
                    </span>
                    <button
                      onClick={() => toggleRecurringRule(rule.id)}
                      className="text-[var(--text-2)] hover:text-[var(--text-1)] transition"
                      title={rule.active ? t('budget_pause') : t('budget_activate')}
                    >
                      {rule.active ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => deleteRecurringRule(rule.id)}
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

      <Card>
        <h3 className="text-sm font-medium mb-3">{t('budget_budgetByCategory')}</h3>
        {budgets.length === 0 ? (
          <div className="text-sm text-[var(--text-2)] text-center py-8">{t('budget_noLimitsSet')}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {budgets.map((b) => {
              const category = categories.find((c) => c.id === b.categoryId);
              const spent = spentByCategory.get(b.categoryId) ?? 0;
              const limit = resolveBudgetLimit(b, expectedForRange, rangeDays);
              const percent = limit > 0 ? (spent / limit) * 100 : 0;
              const over = percent > 100;
              const ruleNote =
                b.percent != null
                  ? `${b.percent}%`
                  : `${formatUAH(b.amountUAH ?? 0)}/${t(PERIOD_KEYS[b.period]).toLowerCase()}`;
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category?.color ?? '#8b949e' }}
                      />
                      <span className={over ? 'text-[var(--red)] font-medium' : 'text-[var(--text-1)]'}>
                        {categoryDisplayName(category, locale) ?? t('common_other')}
                      </span>
                      <span className="text-[var(--text-2)]">({ruleNote})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={over ? 'text-[var(--red)]' : 'text-[var(--text-2)]'}>
                        {formatUAH(spent)} / {formatUAH(limit)}
                      </span>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        className="text-[var(--text-2)] hover:text-[var(--red)] transition"
                      >
                        {t('budget_deleteLimit')}
                      </button>
                    </div>
                  </div>
                  <ProgressBar percent={percent} />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTx(null);
        }}
        defaultPlanned
        editTransaction={editingTx ?? undefined}
      />
      <BudgetLimitModal open={limitModalOpen} onClose={() => setLimitModalOpen(false)} />
      <ExpectedBudgetModal
        open={expectedModalOpen}
        onClose={() => setExpectedModalOpen(false)}
        overrideMonth={overrideMonth}
      />
      <RecurringRuleModal open={recurringModalOpen} onClose={() => setRecurringModalOpen(false)} />
    </div>
  );
}
