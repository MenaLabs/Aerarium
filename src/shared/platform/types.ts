import type { AppData, PdfReportPayload } from '@/types';

export interface PlatformCapabilities {
  pdfExport: boolean;
  nativeSaveDialog: boolean;
}

// Call sites use `platform`, never `window.api` directly.
export interface PlatformAPI {
  capabilities: PlatformCapabilities;
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
}
