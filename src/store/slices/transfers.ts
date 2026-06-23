import type { StateCreator } from 'zustand';
import type { Transfer } from '@/types';
import { persist, type RootState } from '../index';
import { uid } from '@/shared/utils/dates';

export interface TransfersSlice {
  transfers: Transfer[];
  setTransfers: (transfers: Transfer[]) => void;
  addTransfer: (data: Omit<Transfer, 'id' | 'createdAt'>) => void;
  deleteTransfer: (id: string) => void;
  restoreTransfer: (transfer: Transfer) => void;
}

export const createTransfersSlice: StateCreator<RootState, [], [], TransfersSlice> = (
  set,
  get
) => ({
  transfers: [],
  setTransfers: (transfers) => set({ transfers }),
  addTransfer: (data) => {
    const transfer: Transfer = { id: uid(), createdAt: new Date().toISOString(), ...data };
    set({ transfers: [...get().transfers, transfer] });
    get().adjustBalance(transfer.fromAccountId, -transfer.amount);
    get().adjustBalance(transfer.toAccountId, transfer.toAmount);
    persist(get);
  },
  deleteTransfer: (id) => {
    const existing = get().transfers.find((t) => t.id === id);
    if (!existing) return;
    set({ transfers: get().transfers.filter((t) => t.id !== id) });
    get().adjustBalance(existing.fromAccountId, existing.amount);
    get().adjustBalance(existing.toAccountId, -existing.toAmount);
    persist(get);
  },
  restoreTransfer: (transfer) => {
    if (get().transfers.some((t) => t.id === transfer.id)) return;
    set({ transfers: [...get().transfers, transfer] });
    get().adjustBalance(transfer.fromAccountId, -transfer.amount);
    get().adjustBalance(transfer.toAccountId, transfer.toAmount);
    persist(get);
  },
});
