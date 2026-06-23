import { contextBridge, ipcRenderer } from 'electron';
import type { AppData, PdfReportPayload } from '../src/types';

contextBridge.exposeInMainWorld('api', {
  loadData: (): Promise<AppData> => ipcRenderer.invoke('load-data'),
  saveData: (data: AppData): Promise<{ ok: boolean }> => ipcRenderer.invoke('save-data', data),
  exportCSV: (): Promise<{ canceled: boolean; filePath?: string }> =>
    ipcRenderer.invoke('export-csv'),
  backupData: (): Promise<{ canceled: boolean; filePath?: string }> =>
    ipcRenderer.invoke('backup-data'),
  restoreData: (): Promise<{ canceled: boolean; data?: AppData; error?: string }> =>
    ipcRenderer.invoke('restore-data'),
  fetchRates: (): Promise<
    { ok: true; rates: Record<string, number> } | { ok: false; error: string }
  > => ipcRenderer.invoke('fetch-rates'),
  exportPDF: (payload: PdfReportPayload): Promise<{ canceled: boolean; filePath?: string }> =>
    ipcRenderer.invoke('export-pdf', payload),
  exportChartPNG: (
    rect: { x: number; y: number; width: number; height: number },
    suggestedName: string
  ): Promise<{ canceled: boolean; filePath?: string }> =>
    ipcRenderer.invoke('export-chart-png', rect, suggestedName),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open-external', url),
});
