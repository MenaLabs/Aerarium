import type { StateCreator } from 'zustand';
import type { RecurringRule } from '@/types';
import { persist, type RootState } from '../index';
import { uid, currentMonth } from '@/shared/utils/dates';

export interface RecurringSlice {
  recurringRules: RecurringRule[];
  setRecurringRules: (rules: RecurringRule[]) => void;
  addRecurringRule: (rule: Omit<RecurringRule, 'id' | 'createdAt'>) => void;
  deleteRecurringRule: (id: string) => void;
  toggleRecurringRule: (id: string) => void;
  generateDueTransactions: () => void;
}

function daysInMonth(ym: string): number {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export const createRecurringSlice: StateCreator<RootState, [], [], RecurringSlice> = (
  set,
  get
) => ({
  recurringRules: [],
  setRecurringRules: (recurringRules) => set({ recurringRules }),
  addRecurringRule: (data) => {
    const rule: RecurringRule = { id: uid(), createdAt: new Date().toISOString(), ...data };
    set({ recurringRules: [...get().recurringRules, rule] });
    persist(get);
    get().generateDueTransactions();
  },
  deleteRecurringRule: (id) => {
    set({ recurringRules: get().recurringRules.filter((r) => r.id !== id) });
    persist(get);
  },
  toggleRecurringRule: (id) => {
    set({
      recurringRules: get().recurringRules.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      ),
    });
    persist(get);
  },
  generateDueTransactions: () => {
    const { recurringRules, transactions, addTransaction } = get();
    const today = new Date();
    const month = currentMonth();

    for (const rule of recurringRules) {
      if (!rule.active) continue;

      if (rule.frequency === 'monthly') {
        const day = Math.min(rule.dayOfMonth ?? 1, daysInMonth(month));
        const targetDate = `${month}-${String(day).padStart(2, '0')}`;
        const exists = transactions.some(
          (t) => t.recurringId === rule.id && t.date.startsWith(month)
        );
        if (!exists) {
          addTransaction({
            type: rule.type,
            amount: rule.amount,
            currency: rule.currency,
            categoryId: rule.categoryId,
            accountId: rule.accountId,
            description: rule.description,
            date: targetDate,
            isPlanned: true,
            recurringId: rule.id,
          });
        }
      } else {
        const weekday = rule.weekday ?? 0;
        const diff = (weekday - today.getDay() + 7) % 7;
        const target = new Date(today);
        target.setDate(today.getDate() + diff);
        const targetDate = target.toISOString().slice(0, 10);
        const weekStart = new Date(target);
        weekStart.setDate(target.getDate() - 6);
        const weekStartStr = weekStart.toISOString().slice(0, 10);
        const exists = get().transactions.some(
          (t) => t.recurringId === rule.id && t.date >= weekStartStr && t.date <= targetDate
        );
        if (!exists) {
          addTransaction({
            type: rule.type,
            amount: rule.amount,
            currency: rule.currency,
            categoryId: rule.categoryId,
            accountId: rule.accountId,
            description: rule.description,
            date: targetDate,
            isPlanned: true,
            recurringId: rule.id,
          });
        }
      }
    }
  },
});
