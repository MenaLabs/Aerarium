import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Check, Trash2, Pencil, Pause, Play } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { useStore } from '@/store';
import { useToastStore } from '@/store/toastStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmount } from '@/shared/utils/currency';
import {
  convertPeriod,
  daysInRange,
  expectedBudgetForRange,
  resolveBudgetLimit,
} from '@/shared/utils/budget';
import { currentMonth, monthBounds, monthLabel } from '@/shared/utils/dates';
import { useT, type TranslationKey } from '@/shared/i18n';
import { CurrencyPicker } from '@/shared/components/CurrencyPicker';
import { TransactionForm } from '@/features/transactions/TransactionForm';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import type {
  BudgetPeriod,
  Currency,
  RecurFrequency,
  RecurringRule,
  Transaction,
  TxType,
} from '@/types';

type LimitMode = 'amount' | 'percent';
type EntryPeriod = BudgetPeriod | 'custom';

const PERIODS: BudgetPeriod[] = ['day', 'week', 'month', 'year'];

const PERIOD_KEYS: Record<BudgetPeriod, TranslationKey> = {
  day: 'budget_period_day',
  week: 'budget_period_week',
  month: 'budget_period_month',
  year: 'budget_period_year',
};

const WEEKDAY_KEYS: TranslationKey[] = [
  'weekday_sun',
  'weekday_mon',
  'weekday_tue',
  'weekday_wed',
  'weekday_thu',
  'weekday_fri',
  'weekday_sat',
];

function weekdayOptions(t: (key: TranslationKey) => string) {
  return [
    { value: '1', label: t('weekday_mon') },
    { value: '2', label: t('weekday_tue') },
    { value: '3', label: t('weekday_wed') },
    { value: '4', label: t('weekday_thu') },
    { value: '5', label: t('weekday_fri') },
    { value: '6', label: t('weekday_sat') },
    { value: '0', label: t('weekday_sun') },
  ];
}

function frequencyLabel(
  rule: RecurringRule,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string {
  if (rule.frequency === 'monthly') {
    return t('budget_monthlyOn', { day: rule.dayOfMonth ?? 1 });
  }
  return t('budget_weeklyOn', { day: t(WEEKDAY_KEYS[rule.weekday ?? 0]) });
}

// If [from,to] is exactly one whole calendar month, return its "YYYY-MM".
function singleMonthOf(from: string, to: string): string | null {
  const ym = from.slice(0, 7);
  const b = monthBounds(ym);
  return from === b.from && to === b.to ? ym : null;
}

function periodPill(active: boolean): string {
  return `rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
    active ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
  }`;
}

interface BudgetLimitModalProps {
  open: boolean;
  onClose: () => void;
}

function BudgetLimitModal({ open, onClose }: BudgetLimitModalProps) {
  const categories = useStore((s) => s.categories);
  const setBudget = useStore((s) => s.setBudget);
  const setBudgetPercent = useStore((s) => s.setBudgetPercent);
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );
  const { t, locale } = useT();
  const { defaultCurrency } = useCurrency();

  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? '');
  const [mode, setMode] = useState<LimitMode>('amount');
  const [period, setPeriod] = useState<BudgetPeriod>('month');
  const [amount, setAmount] = useState('');
  const [percent, setPercent] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode('amount');
    setPeriod('month');
    setAmount('');
    setPercent('');
    setCategoryId(expenseCategories[0]?.id ?? '');
  }, [open, expenseCategories]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;
    if (mode === 'amount') {
      const parsed = parseFloat(amount.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) return;
      setBudget(categoryId, parsed, period);
    } else {
      const parsed = parseFloat(percent.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0 || parsed > 100) return;
      setBudgetPercent(categoryId, parsed, period);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('budget_setLimitTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label={t('common_category')}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={expenseCategories.map((c) => ({ value: c.id, label: categoryDisplayName(c, locale)! }))}
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('amount')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              mode === 'amount' ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('budget_amountUah', { currency: defaultCurrency })}
          </button>
          <button
            type="button"
            onClick={() => setMode('percent')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              mode === 'percent' ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('budget_percentOfExpenses')}
          </button>
        </div>

        {mode === 'amount' ? (
          <Input
            label={t('budget_amountUah', { currency: defaultCurrency })}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
        ) : (
          <Input
            label={t('budget_percentInput')}
            inputMode="decimal"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            placeholder="20"
            autoFocus
          />
        )}

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">{t('budget_period')}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PERIODS.map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)} className={periodPill(period === p)}>
                {t(PERIOD_KEYS[p])}
              </button>
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

interface ExpectedBudgetModalProps {
  open: boolean;
  onClose: () => void;
  overrideMonth: string | null; // when the current view is a single calendar month
}

function ExpectedBudgetModal({ open, onClose, overrideMonth }: ExpectedBudgetModalProps) {
  const expectedBudget = useStore((s) => s.expectedBudget);
  const setExpectedBudget = useStore((s) => s.setExpectedBudget);
  const monthlyBudgets = useStore((s) => s.monthlyBudgets);
  const setMonthlyBudget = useStore((s) => s.setMonthlyBudget);
  const deleteMonthlyBudget = useStore((s) => s.deleteMonthlyBudget);
  const { t, locale } = useT();
  const { defaultCurrency, toUAH, fromUAH } = useCurrency();

  const [period, setPeriod] = useState<EntryPeriod>('month');
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('30');
  const [sync, setSync] = useState(true);
  const [override, setOverride] = useState('');

  useEffect(() => {
    if (!open) return;
    if (expectedBudget) {
      setPeriod(expectedBudget.period);
      setAmount(String(Number(fromUAH(expectedBudget.amount).toFixed(2))));
    } else {
      setPeriod('month');
      setAmount('');
    }
    setDays('30');
    setSync(true);
    const ov = overrideMonth ? monthlyBudgets[overrideMonth] : undefined;
    setOverride(ov != null ? String(Number(fromUAH(ov).toFixed(2))) : '');
  }, [open, overrideMonth, expectedBudget, monthlyBudgets, fromUAH]);

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const parsedDays = parseInt(days, 10);
  // amount per chosen period, expressed in the default currency
  const perPeriodAmount =
    period === 'custom'
      ? !isNaN(parsedAmount) && parsedDays > 0
        ? parsedAmount / parsedDays
        : NaN
      : parsedAmount;
  const equivPeriod: BudgetPeriod = period === 'custom' ? 'day' : period;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isNaN(perPeriodAmount) && perPeriodAmount > 0) {
      setExpectedBudget({ amount: toUAH(perPeriodAmount, defaultCurrency), period: equivPeriod });
    }
    if (overrideMonth) {
      const ov = parseFloat(override.replace(',', '.'));
      if (override.trim() === '' || isNaN(ov) || ov <= 0) {
        if (monthlyBudgets[overrideMonth] != null) deleteMonthlyBudget(overrideMonth);
      } else {
        setMonthlyBudget(overrideMonth, toUAH(ov, defaultCurrency));
      }
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('budget_expectedBudgetTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-xs text-[var(--text-2)]">{t('budget_monthlyBudgetHint')}</p>

        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(p)} className={periodPill(period === p)}>
              {t(PERIOD_KEYS[p])}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPeriod('custom')}
            className={periodPill(period === 'custom')}
          >
            {t('budget_custom')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('budget_amountUah', { currency: defaultCurrency })}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
          {period === 'custom' && (
            <Input
              label={t('budget_customDays')}
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-2)]">
          <input
            type="checkbox"
            checked={sync}
            onChange={(e) => setSync(e.target.checked)}
            className="accent-[var(--blue)]"
          />
          {t('budget_sync')}
        </label>

        {sync && !isNaN(perPeriodAmount) && perPeriodAmount > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-2)]">
            {PERIODS.map((p) => (
              <span key={p}>
                {formatAmount(convertPeriod(perPeriodAmount, equivPeriod, p), defaultCurrency)}/
                {t(PERIOD_KEYS[p]).toLowerCase()}
              </span>
            ))}
          </div>
        )}

        {overrideMonth && (
          <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-1">
            <span className="text-xs text-[var(--text-2)]">
              {t('budget_overrideForMonth', { month: monthLabel(overrideMonth, locale) })}
            </span>
            <Input
              inputMode="decimal"
              value={override}
              onChange={(e) => setOverride(e.target.value)}
              placeholder={t('budget_overridePlaceholder')}
            />
          </div>
        )}

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

interface RecurringRuleModalProps {
  open: boolean;
  onClose: () => void;
}

function RecurringRuleModal({ open, onClose }: RecurringRuleModalProps) {
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const addRecurringRule = useStore((s) => s.addRecurringRule);
  const { t, locale } = useT();
  const { defaultCurrency } = useCurrency();

  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RecurFrequency>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [weekday, setWeekday] = useState('1');

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!open) return;
    setType('expense');
    setAmount('');
    setCurrency(defaultCurrency);
    setDescription('');
    setFrequency('monthly');
    setDayOfMonth('1');
    setWeekday('1');
    setAccountId(accounts[0]?.id ?? '');
  }, [open, accounts, defaultCurrency]);

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? '');
    }
  }, [type, filteredCategories, categoryId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0 || !categoryId || !accountId) return;
    addRecurringRule({
      type,
      amount: parsed,
      currency,
      categoryId,
      accountId,
      description,
      frequency,
      dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth, 10) : undefined,
      weekday: frequency === 'weekly' ? parseInt(weekday, 10) : undefined,
      active: true,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('budget_newRecurringTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              type === 'income' ? 'bg-[var(--green)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('common_income')}
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              type === 'expense' ? 'bg-[var(--red)] text-white' : 'bg-[var(--bg-hover)] text-[var(--text-2)]'
            }`}
          >
            {t('common_expense')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('common_amount')}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            autoFocus
          />
          <CurrencyPicker
            label={t('common_currency')}
            value={currency}
            onChange={(code) => setCurrency(code as Currency)}
          />
        </div>

        <Select
          label={t('common_category')}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={filteredCategories.map((c) => ({ value: c.id, label: categoryDisplayName(c, locale)! }))}
        />

        <Select
          label={t('common_account')}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accounts.map((a) => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
        />

        <Select
          label={t('budget_frequency')}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurFrequency)}
          options={[
            { value: 'monthly', label: t('budget_monthly') },
            { value: 'weekly', label: t('budget_weekly') },
          ]}
        />

        {frequency === 'monthly' ? (
          <Input
            label={t('budget_dayOfMonth')}
            type="number"
            min={1}
            max={28}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
          />
        ) : (
          <Select
            label={t('budget_weekday')}
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            options={weekdayOptions(t)}
          />
        )}

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
          <Button type="submit">{t('common_save')}</Button>
        </div>
      </form>
    </Modal>
  );
}

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
