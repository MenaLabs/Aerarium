import { create } from 'zustand';
import type { AppData, NavPage } from '@/types';
import { platform } from '@/shared/platform';
import { createAccountsSlice, type AccountsSlice } from './slices/accounts';
import { createTransactionsSlice, type TransactionsSlice } from './slices/transactions';
import { createCategoriesSlice, type CategoriesSlice } from './slices/categories';
import { createBudgetsSlice, type BudgetsSlice } from './slices/budgets';
import { createTransfersSlice, type TransfersSlice } from './slices/transfers';
import { createRecurringSlice, type RecurringSlice } from './slices/recurring';
import { createChartsSlice, type ChartsSlice } from './slices/charts';
import { createSettingsSlice, type SettingsSlice } from './slices/settings';

export type RootState = AccountsSlice &
  TransactionsSlice &
  CategoriesSlice &
  BudgetsSlice &
  TransfersSlice &
  RecurringSlice &
  ChartsSlice &
  SettingsSlice & {
    isLoaded: boolean;
    hydrate: (data: AppData) => void;
    page: NavPage;
    setPage: (page: NavPage) => void;
    showOnboarding: boolean;
    setShowOnboarding: (value: boolean) => void;
  };

export function persist(get: () => RootState): void {
  const state = get();
  const data: AppData = {
    version: '1.0.0',
    accounts: state.accounts,
    transactions: state.transactions,
    categories: state.categories,
    budgets: state.budgets,
    transfers: state.transfers,
    recurringRules: state.recurringRules,
    chartWidgets: state.chartWidgets,
    settings: state.settings,
    updatedAt: new Date().toISOString(),
  };
  void platform.saveData(data);
}

export const useStore = create<RootState>()((...a) => {
  const [set] = a;
  return {
    ...createAccountsSlice(...a),
    ...createTransactionsSlice(...a),
    ...createCategoriesSlice(...a),
    ...createBudgetsSlice(...a),
    ...createTransfersSlice(...a),
    ...createRecurringSlice(...a),
    ...createChartsSlice(...a),
    ...createSettingsSlice(...a),
    isLoaded: false,
    page: 'dashboard',
    setPage: (page) => set({ page }),
    showOnboarding: false,
    setShowOnboarding: (value) => set({ showOnboarding: value }),
    hydrate: (data: AppData) => {
      set({
        accounts: data.accounts,
        transactions: data.transactions,
        categories: data.categories,
        budgets: data.budgets,
        transfers: data.transfers,
        recurringRules: data.recurringRules,
        chartWidgets: data.chartWidgets,
        settings: data.settings,
        isLoaded: true,
      });
    },
  };
});
