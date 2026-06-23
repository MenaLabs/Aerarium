import type { Budget } from '@/types';

// Percent-based limits are a share of the user's expected monthly budget
// (a stable target they set), not of actual spending, so the limit doesn't
// move as money is spent.
export function resolveBudgetLimit(budget: Budget, expectedMonthlyBudget: number): number {
  if (budget.percent != null) return (budget.percent / 100) * expectedMonthlyBudget;
  return budget.amountUAH ?? 0;
}
