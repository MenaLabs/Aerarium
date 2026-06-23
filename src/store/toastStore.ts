import { create } from 'zustand';

interface ToastState {
  id: number;
  message: string;
  onUndo: () => void;
}

interface ToastStore {
  toast: ToastState | null;
  show: (message: string, onUndo: () => void) => void;
  dismiss: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;
let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (message, onUndo) => {
    if (timer) clearTimeout(timer);
    const id = ++counter;
    set({ toast: { id, message, onUndo } });
    timer = setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : {}));
    }, 5000);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ toast: null });
  },
}));
