import type { StateCreator } from 'zustand';
import type { Budget } from '@/types';
import { persist, type RootState } from '../index';
import { uid } from '@/shared/utils/dates';

export interface BudgetsSlice {
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  setBudget: (month: string, categoryId: string, amountUAH: number) => void;
  setBudgetPercent: (month: string, categoryId: string, percent: number) => void;
  deleteBudget: (id: string) => void;
}

export const createBudgetsSlice: StateCreator<RootState, [], [], BudgetsSlice> = (set, get) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  setBudget: (month, categoryId, amountUAH) => {
    const existing = get().budgets.find((b) => b.month === month && b.categoryId === categoryId);
    if (existing) {
      set({
        budgets: get().budgets.map((b) =>
          b.id === existing.id ? { ...b, amountUAH, percent: undefined } : b
        ),
      });
    } else {
      const budget: Budget = { id: uid(), month, categoryId, amountUAH };
      set({ budgets: [...get().budgets, budget] });
    }
    persist(get);
  },
  setBudgetPercent: (month, categoryId, percent) => {
    const existing = get().budgets.find((b) => b.month === month && b.categoryId === categoryId);
    if (existing) {
      set({
        budgets: get().budgets.map((b) =>
          b.id === existing.id ? { ...b, percent, amountUAH: undefined } : b
        ),
      });
    } else {
      const budget: Budget = { id: uid(), month, categoryId, percent };
      set({ budgets: [...get().budgets, budget] });
    }
    persist(get);
  },
  deleteBudget: (id) => {
    set({ budgets: get().budgets.filter((b) => b.id !== id) });
    persist(get);
  },
});
