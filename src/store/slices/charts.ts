import type { StateCreator } from 'zustand';
import type { ChartWidget } from '@/types';
import { persist, type RootState } from '../index';
import { uid } from '@/shared/utils/dates';

export interface ChartsSlice {
  chartWidgets: ChartWidget[];
  setChartWidgets: (widgets: ChartWidget[]) => void;
  addChartWidget: (widget: Omit<ChartWidget, 'id' | 'createdAt'>) => void;
  updateChartWidget: (id: string, widget: Omit<ChartWidget, 'id' | 'createdAt'>) => void;
  deleteChartWidget: (id: string) => void;
}

export const createChartsSlice: StateCreator<RootState, [], [], ChartsSlice> = (set, get) => ({
  chartWidgets: [],
  setChartWidgets: (chartWidgets) => set({ chartWidgets }),
  addChartWidget: (data) => {
    const widget: ChartWidget = { id: uid(), createdAt: new Date().toISOString(), ...data };
    set({ chartWidgets: [...get().chartWidgets, widget] });
    persist(get);
  },
  updateChartWidget: (id, data) => {
    set({
      chartWidgets: get().chartWidgets.map((w) => (w.id === id ? { ...w, ...data } : w)),
    });
    persist(get);
  },
  deleteChartWidget: (id) => {
    set({ chartWidgets: get().chartWidgets.filter((w) => w.id !== id) });
    persist(get);
  },
});
