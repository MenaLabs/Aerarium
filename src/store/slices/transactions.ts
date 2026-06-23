import type { StateCreator } from 'zustand';
import type { Transaction } from '@/types';
import { persist, type RootState } from '../index';
import { uid } from '@/shared/utils/dates';

export interface TransactionsSlice {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  restoreTransaction: (tx: Transaction) => void;
  completeTransaction: (id: string) => void;
}

function balanceDelta(tx: Pick<Transaction, 'type' | 'amount'>): number {
  return tx.type === 'income' ? tx.amount : -tx.amount;
}

export const createTransactionsSlice: StateCreator<RootState, [], [], TransactionsSlice> = (
  set,
  get
) => ({
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (data) => {
    const tx: Transaction = { id: uid(), createdAt: new Date().toISOString(), ...data };
    set({ transactions: [...get().transactions, tx] });
    if (!tx.isPlanned) {
      get().adjustBalance(tx.accountId, balanceDelta(tx));
    }
    persist(get);
  },
  updateTransaction: (id, patch) => {
    const existing = get().transactions.find((t) => t.id === id);
    if (!existing) return;
    const updated: Transaction = { ...existing, ...patch };
    set({ transactions: get().transactions.map((t) => (t.id === id ? updated : t)) });
    if (!existing.isPlanned) {
      get().adjustBalance(existing.accountId, -balanceDelta(existing));
    }
    if (!updated.isPlanned) {
      get().adjustBalance(updated.accountId, balanceDelta(updated));
    }
    persist(get);
  },
  deleteTransaction: (id) => {
    const existing = get().transactions.find((t) => t.id === id);
    if (!existing) return;
    set({ transactions: get().transactions.filter((t) => t.id !== id) });
    if (!existing.isPlanned) {
      get().adjustBalance(existing.accountId, -balanceDelta(existing));
    }
    persist(get);
  },
  restoreTransaction: (tx) => {
    if (get().transactions.some((t) => t.id === tx.id)) return;
    set({ transactions: [...get().transactions, tx] });
    if (!tx.isPlanned) {
      get().adjustBalance(tx.accountId, balanceDelta(tx));
    }
    persist(get);
  },
  completeTransaction: (id) => {
    const existing = get().transactions.find((t) => t.id === id);
    if (!existing || !existing.isPlanned) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated: Transaction = { ...existing, isPlanned: false, date: today };
    set({ transactions: get().transactions.map((t) => (t.id === id ? updated : t)) });
    get().adjustBalance(updated.accountId, balanceDelta(updated));
    persist(get);
  },
});
