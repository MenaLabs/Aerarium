import type { StateCreator } from 'zustand';
import type { Currency, Locale, Settings } from '@/types';
import { persist, type RootState } from '../index';

export interface SettingsSlice {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateRates: (rates: Record<string, number>) => void;
  setTheme: (theme: Settings['theme']) => void;
  setThemeId: (themeId: string) => void;
  setDefaultCurrency: (currency: Currency) => void;
  setAutoImportRates: (value: boolean) => void;
  setLocale: (locale: Locale) => void;
  setAutoBackupEnabled: (value: boolean) => void;
}

const DEFAULT_SETTINGS: Settings = {
  rates: { USD: 41.5, EUR: 44.2 },
  defaultCurrency: 'UAH',
  theme: 'dark',
  themeId: 'vault',
  autoImportRates: false,
  locale: 'en',
  autoBackupEnabled: true,
};

export const createSettingsSlice: StateCreator<RootState, [], [], SettingsSlice> = (
  set,
  get
) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (settings) => {
    set({ settings });
    persist(get);
  },
  updateRates: (rates) => {
    set({ settings: { ...get().settings, rates: { ...get().settings.rates, ...rates } } });
    persist(get);
  },
  setTheme: (theme) => {
    set({ settings: { ...get().settings, theme } });
    persist(get);
  },
  setThemeId: (themeId) => {
    set({ settings: { ...get().settings, themeId } });
    persist(get);
  },
  setDefaultCurrency: (currency) => {
    set({ settings: { ...get().settings, defaultCurrency: currency } });
    persist(get);
  },
  setAutoImportRates: (value) => {
    set({ settings: { ...get().settings, autoImportRates: value } });
    persist(get);
  },
  setLocale: (locale) => {
    set({ settings: { ...get().settings, locale } });
    persist(get);
  },
  setAutoBackupEnabled: (value) => {
    set({ settings: { ...get().settings, autoBackupEnabled: value } });
    persist(get);
  },
});
