/// <reference types="vite/client" />

import type { AppData, PdfReportPayload } from './types';

declare global {
  const __APP_VERSION__: string;
  interface Window {
    api: {
      loadData: () => Promise<AppData>;
      saveData: (data: AppData) => Promise<{ ok: boolean }>;
      exportCSV: () => Promise<{ canceled: boolean; filePath?: string }>;
      backupData: () => Promise<{ canceled: boolean; filePath?: string }>;
      restoreData: () => Promise<{ canceled: boolean; data?: AppData; error?: string }>;
      fetchRates: () => Promise<
        { ok: true; rates: Record<string, number> } | { ok: false; error: string }
      >;
      exportPDF: (payload: PdfReportPayload) => Promise<{ canceled: boolean; filePath?: string }>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}

export {};
