import type { StateCreator } from 'zustand';
import type { Account } from '@/types';
import { persist, type RootState } from '../index';
import { uid } from '@/shared/utils/dates';

export interface AccountsSlice {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  adjustBalance: (accountId: string, delta: number) => void;
}

export const createAccountsSlice: StateCreator<RootState, [], [], AccountsSlice> = (
  set,
  get
) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (data) => {
    const account: Account = { id: uid(), createdAt: new Date().toISOString(), ...data };
    set({ accounts: [...get().accounts, account] });
    persist(get);
  },
  updateAccount: (id, patch) => {
    set({ accounts: get().accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
    persist(get);
  },
  deleteAccount: (id) => {
    set({ accounts: get().accounts.filter((a) => a.id !== id) });
    persist(get);
  },
  adjustBalance: (accountId, delta) => {
    set({
      accounts: get().accounts.map((a) =>
        a.id === accountId ? { ...a, balance: a.balance + delta } : a
      ),
    });
    persist(get);
  },
});
