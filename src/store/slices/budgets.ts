import type { StateCreator } from 'zustand';
import type { Budget, BudgetPeriod, ExpectedBudget } from '@/types';
import { persist, type RootState } from '../index';
import { uid } from '@/shared/utils/dates';

export interface BudgetsSlice {
  budgets: Budget[];
  expectedBudget: ExpectedBudget | null;
  monthlyBudgets: Record<string, number>;
  setBudgets: (budgets: Budget[]) => void;
  setExpectedBudget: (profile: ExpectedBudget | null) => void;
  setMonthlyBudgets: (monthlyBudgets: Record<string, number>) => void;
  setMonthlyBudget: (month: string, amountUAH: number) => void;
  deleteMonthlyBudget: (month: string) => void;
  setBudget: (categoryId: string, amountUAH: number, period: BudgetPeriod) => void;
  setBudgetPercent: (categoryId: string, percent: number, period: BudgetPeriod) => void;
  deleteBudget: (id: string) => void;
}

function upsertBudget(
  budgets: Budget[],
  categoryId: string,
  patch: Partial<Budget>
): Budget[] {
  const existing = budgets.find((b) => b.categoryId === categoryId);
  if (existing) {
    return budgets.map((b) =>
      b.id === existing.id ? { ...b, amountUAH: undefined, percent: undefined, ...patch } : b
    );
  }
  return [...budgets, { id: uid(), categoryId, period: 'month', ...patch } as Budget];
}

export const createBudgetsSlice: StateCreator<RootState, [], [], BudgetsSlice> = (set, get) => ({
  budgets: [],
  expectedBudget: null,
  monthlyBudgets: {},
  setBudgets: (budgets) => set({ budgets }),
  setExpectedBudget: (profile) => {
    set({ expectedBudget: profile });
    persist(get);
  },
  setMonthlyBudgets: (monthlyBudgets) => set({ monthlyBudgets }),
  setMonthlyBudget: (month, amountUAH) => {
    set({ monthlyBudgets: { ...get().monthlyBudgets, [month]: amountUAH } });
    persist(get);
  },
  deleteMonthlyBudget: (month) => {
    const next = { ...get().monthlyBudgets };
    delete next[month];
    set({ monthlyBudgets: next });
    persist(get);
  },
  setBudget: (categoryId, amountUAH, period) => {
    set({ budgets: upsertBudget(get().budgets, categoryId, { amountUAH, period }) });
    persist(get);
  },
  setBudgetPercent: (categoryId, percent, period) => {
    set({ budgets: upsertBudget(get().budgets, categoryId, { percent, period }) });
    persist(get);
  },
  deleteBudget: (id) => {
    set({ budgets: get().budgets.filter((b) => b.id !== id) });
    persist(get);
  },
});
