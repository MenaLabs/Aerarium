import type { Budget } from '@/types';

export function resolveBudgetLimit(budget: Budget, totalMonthExpenses: number): number {
  if (budget.percent != null) return (budget.percent / 100) * totalMonthExpenses;
  return budget.amountUAH ?? 0;
}
