import { Card } from '@/shared/components/Card';
import { useStore } from '@/store';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useT } from '@/shared/i18n';

interface SummaryCardsProps {
  month: string;
}

export function SummaryCards({ month }: SummaryCardsProps) {
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const { toUAH, formatUAH } = useCurrency();
  const { t } = useT();

  const totalBalance = accounts.reduce((sum, a) => sum + toUAH(a.balance, a.currency), 0);

  const monthTx = transactions.filter((t) => !t.isPlanned && t.date.startsWith(month));
  const income = monthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + toUAH(t.amount, t.currency), 0);
  const expense = monthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + toUAH(t.amount, t.currency), 0);
  const balance = income - expense;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <div className="text-xs text-[var(--text-2)] mb-1">{t('dashboard_totalBalance')}</div>
        <div className="text-xl font-semibold">{formatUAH(totalBalance)}</div>
      </Card>
      <Card>
        <div className="text-xs text-[var(--text-2)] mb-1">{t('dashboard_monthIncome')}</div>
        <div className="text-xl font-semibold text-[var(--green)]">{formatUAH(income)}</div>
      </Card>
      <Card>
        <div className="text-xs text-[var(--text-2)] mb-1">{t('dashboard_monthExpense')}</div>
        <div className="text-xl font-semibold text-[var(--red)]">{formatUAH(expense)}</div>
      </Card>
      <Card>
        <div className="text-xs text-[var(--text-2)] mb-1">{t('dashboard_monthBalance')}</div>
        <div
          className={`text-xl font-semibold ${
            balance >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
          }`}
        >
          {formatUAH(balance, { sign: true })}
        </div>
      </Card>
    </div>
  );
}
