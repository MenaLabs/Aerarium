import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import type { AppData, Locale, PdfReportPayload } from '../src/types';
import { DEFAULT_DATA } from '../src/shared/utils/defaultData';
import { en } from '../src/shared/i18n/en';
import { uk } from '../src/shared/i18n/uk';
import { FIAT_CURRENCIES, CRYPTO_CURRENCIES } from '../src/shared/utils/currencies';
import { categoryDisplayName } from '../src/shared/utils/categoryName';
import { migrateAppData } from '../src/shared/utils/migrate';

const DICTS = { en, uk };

function tMain(
  locale: Locale,
  key: keyof typeof en,
  params?: Record<string, string | number>
): string {
  let text = DICTS[locale]?.[key] ?? en[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

app.setName('Aerarium');

const isDev = !app.isPackaged;
const dataDir = isDev
  ? path.join(process.cwd(), 'data')
  : path.join(app.getPath('userData'), 'data');
const dataFile = path.join(dataDir, 'aerarium.json');

function ensureDataDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function detectSystemLocale(): Locale {
  return app.getLocale().toLowerCase().startsWith('uk') ? 'uk' : 'en';
}

function loadData(): AppData {
  ensureDataDir();
  if (!fs.existsSync(dataFile)) {
    return { ...DEFAULT_DATA, settings: { ...DEFAULT_DATA.settings, locale: detectSystemLocale() } };
  }
  try {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    return migrateAppData(JSON.parse(raw) as AppData);
  } catch {
    return DEFAULT_DATA;
  }
}

let saveTimer: NodeJS.Timeout | null = null;
let pendingData: AppData | null = null;

function saveData(data: AppData): void {
  pendingData = data;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    flushPendingSave();
  }, 300);
}

function flushPendingSave(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (pendingData) {
    ensureDataDir();
    fs.writeFileSync(dataFile, JSON.stringify(pendingData, null, 2), 'utf-8');
    pendingData = null;
  }
}

const AUTO_BACKUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const AUTO_BACKUP_KEEP = 10;

function maybeAutoBackup(data: AppData): void {
  if (data.settings.autoBackupEnabled === false) return;
  const last = data.settings.lastAutoBackupAt
    ? new Date(data.settings.lastAutoBackupAt).getTime()
    : 0;
  if (Date.now() - last < AUTO_BACKUP_INTERVAL_MS) return;
  try {
    const dir = path.join(app.getPath('userData'), 'backups');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileName = `aerarium-backup-${new Date().toISOString().slice(0, 10)}.json`;
    fs.writeFileSync(path.join(dir, fileName), JSON.stringify(data, null, 2), 'utf-8');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('aerarium-backup-')).sort();
    while (files.length > AUTO_BACKUP_KEEP) {
      const oldest = files.shift();
      if (oldest) fs.unlinkSync(path.join(dir, oldest));
    }
    saveData({
      ...data,
      settings: { ...data.settings, lastAutoBackupAt: new Date().toISOString() },
    });
  } catch {
    // best-effort, never block app startup on backup failure
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildTransactionRows(data: AppData, locale: Locale): { header: string[]; rows: string[][] } {
  const header = [
    tMain(locale, 'common_date'),
    tMain(locale, 'common_type'),
    tMain(locale, 'common_amount'),
    tMain(locale, 'common_currency'),
    tMain(locale, 'common_category'),
    tMain(locale, 'common_account'),
    tMain(locale, 'common_description'),
    tMain(locale, 'csv_colPlanned'),
  ];
  const categoryById = new Map(
    data.categories.map((c) => [c.id, categoryDisplayName(c, locale) ?? c.name])
  );
  const accountById = new Map(data.accounts.map((a) => [a.id, a.name]));
  const rows = data.transactions.map((t) => [
    t.date,
    t.type === 'income' ? tMain(locale, 'common_income') : tMain(locale, 'common_expense'),
    String(t.amount),
    t.currency,
    categoryById.get(t.categoryId) ?? '',
    accountById.get(t.accountId) ?? '',
    t.description,
    t.isPlanned ? tMain(locale, 'common_yes') : tMain(locale, 'common_no'),
  ]);
  return { header, rows };
}

async function exportCSV(): Promise<{ canceled: boolean; filePath?: string }> {
  const data = loadData();
  const locale = data.settings.locale;
  const saveOptions = {
    title: tMain(locale, 'main_exportCsvTitle'),
    defaultPath: 'transactions.csv',
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  };
  const win = BrowserWindow.getFocusedWindow();
  const result = win
    ? await dialog.showSaveDialog(win, saveOptions)
    : await dialog.showSaveDialog(saveOptions);
  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }
  const { header, rows } = buildTransactionRows(data, locale);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  fs.writeFileSync(result.filePath, '﻿' + csv, 'utf-8');
  return { canceled: false, filePath: result.filePath };
}

async function backupData(): Promise<{ canceled: boolean; filePath?: string }> {
  const data = loadData();
  const saveOptions = {
    title: tMain(data.settings.locale, 'main_backupTitle'),
    defaultPath: 'aerarium-backup.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  };
  const win = BrowserWindow.getFocusedWindow();
  const result = win
    ? await dialog.showSaveDialog(win, saveOptions)
    : await dialog.showSaveDialog(saveOptions);
  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }
  fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
  return { canceled: false, filePath: result.filePath };
}

async function restoreData(): Promise<{ canceled: boolean; data?: AppData; error?: string }> {
  const locale = loadData().settings.locale;
  const openOptions = {
    title: tMain(locale, 'main_restoreTitle'),
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'] as Array<'openFile'>,
  };
  const win = BrowserWindow.getFocusedWindow();
  const result = win
    ? await dialog.showOpenDialog(win, openOptions)
    : await dialog.showOpenDialog(openOptions);
  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }
  const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
  let data: AppData;
  try {
    data = migrateAppData(JSON.parse(raw) as AppData);
  } catch {
    return { canceled: true, error: tMain(locale, 'settings_backupDecryptError') };
  }
  ensureDataDir();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
  return { canceled: false, data };
}

// Frankfurter (ECB data) is deliberately not in this list: the ECB doesn't publish
// UAH at all, so it can never serve as a source for our UAH-pivoted rate storage.
const OPEN_ER_API_URL = 'https://open.er-api.com/v6/latest/USD';
const EXCHANGERATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const FAWAZ_CURRENCY_API_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

let fawazUsdRatesCache: Record<string, number> | null | undefined;
async function getFawazUsdRates(): Promise<Record<string, number> | null> {
  if (fawazUsdRatesCache !== undefined) return fawazUsdRatesCache;
  const json = (await fetchJson(FAWAZ_CURRENCY_API_URL)) as { usd?: Record<string, number> } | null;
  fawazUsdRatesCache = json?.usd ?? null;
  return fawazUsdRatesCache;
}

// Returns "units of CODE per 1 USD" (uppercase keys), guaranteed to include UAH
// when non-null. Tries multiple independent providers so a single outage or
// region block doesn't take down rate updates entirely.
async function fetchUsdBasedFiatRates(): Promise<Record<string, number> | null> {
  for (const url of [OPEN_ER_API_URL, EXCHANGERATE_API_URL]) {
    const json = (await fetchJson(url)) as { rates?: Record<string, number> } | null;
    if (json?.rates?.UAH) return json.rates;
  }
  const fawaz = await getFawazUsdRates();
  if (fawaz?.uah) {
    const upper: Record<string, number> = {};
    for (const [k, v] of Object.entries(fawaz)) upper[k.toUpperCase()] = v;
    return upper;
  }
  return null;
}

async function fetchRates(): Promise<
  { ok: true; rates: Record<string, number> } | { ok: false; error: string }
> {
  const locale = loadData().settings.locale;
  try {
    const usdRates = await fetchUsdBasedFiatRates();
    if (!usdRates) {
      return { ok: false, error: tMain(locale, 'rates_networkError') };
    }
    const uahPerUsd = usdRates.UAH;
    const rates: Record<string, number> = { USD: uahPerUsd };
    for (const c of FIAT_CURRENCIES) {
      if (c.code === 'UAH' || c.code === 'USD') continue;
      const perUsd = usdRates[c.code];
      if (perUsd) rates[c.code] = uahPerUsd / perUsd;
    }

    const ids = CRYPTO_CURRENCIES.map((c) => c.coingeckoId).join(',');
    const cg = (await fetchJson(`${COINGECKO_URL}?ids=${ids}&vs_currencies=uah`)) as Record<
      string,
      { uah: number }
    > | null;
    for (const c of CRYPTO_CURRENCIES) {
      const v = c.coingeckoId ? cg?.[c.coingeckoId]?.uah : undefined;
      if (v) rates[c.code] = v;
    }
    const missingCrypto = CRYPTO_CURRENCIES.filter((c) => !rates[c.code]);
    if (missingCrypto.length > 0) {
      const fawaz = await getFawazUsdRates();
      if (fawaz) {
        for (const c of missingCrypto) {
          const perUsd = fawaz[c.code.toLowerCase()];
          if (perUsd) rates[c.code] = uahPerUsd / perUsd;
        }
      }
    }

    return { ok: true, rates };
  } catch {
    return { ok: false, error: tMain(locale, 'rates_networkError') };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function exportPDF(
  payload: PdfReportPayload
): Promise<{ canceled: boolean; filePath?: string }> {
  const locale = loadData().settings.locale;
  const saveOptions = {
    title: tMain(locale, 'main_pdfExportTitle'),
    defaultPath: 'transactions.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  };
  const win = BrowserWindow.getFocusedWindow();
  const result = win
    ? await dialog.showSaveDialog(win, saveOptions)
    : await dialog.showSaveDialog(saveOptions);
  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  const rowsHtml = payload.rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.date)}</td>
        <td>${escapeHtml(r.category)}</td>
        <td>${escapeHtml(r.account)}</td>
        <td>${escapeHtml(r.description)}</td>
        <td style="text-align:right">${escapeHtml(r.amount)}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 11px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { padding: 6px 8px; border-bottom: 1px solid #ddd; text-align: left; }
  th { background: #f3f3f3; }
</style>
</head>
<body>
  <h1>${escapeHtml(payload.title)}</h1>
  <div class="meta">${tMain(locale, 'main_pdfGeneratedAt')} ${new Date().toLocaleString(locale === 'uk' ? 'uk-UA' : 'en-US')}</div>
  <table>
    <thead>
      <tr><th>${tMain(locale, 'common_date')}</th><th>${tMain(locale, 'common_category')}</th><th>${tMain(locale, 'common_account')}</th><th>${tMain(locale, 'common_description')}</th><th style="text-align:right">${tMain(locale, 'common_amount')}</th></tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  const pdfWin = new BrowserWindow({ show: false });
  await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  const pdfBuffer = await pdfWin.webContents.printToPDF({});
  pdfWin.destroy();
  fs.writeFileSync(result.filePath, pdfBuffer);
  return { canceled: false, filePath: result.filePath };
}

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '_').trim();
  return cleaned || 'chart';
}

async function exportChartPNG(
  rect: { x: number; y: number; width: number; height: number },
  suggestedName: string
): Promise<{ canceled: boolean; filePath?: string }> {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return { canceled: true };
  const locale = loadData().settings.locale;
  // Capture the live rendered region (resolves all CSS vars/fonts) rather than
  // re-serializing the SVG, which is brittle.
  const image = await win.webContents.capturePage({
    x: Math.max(0, Math.round(rect.x)),
    y: Math.max(0, Math.round(rect.y)),
    width: Math.max(1, Math.round(rect.width)),
    height: Math.max(1, Math.round(rect.height)),
  });
  const saveOptions = {
    title: tMain(locale, 'analytics_exportChart'),
    defaultPath: `${sanitizeFileName(suggestedName)}.png`,
    filters: [{ name: 'PNG', extensions: ['png'] }],
  };
  const result = await dialog.showSaveDialog(win, saveOptions);
  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }
  fs.writeFileSync(result.filePath, image.toPNG());
  return { canceled: false, filePath: result.filePath };
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0d1117',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

ipcMain.handle('load-data', () => {
  const data = loadData();
  maybeAutoBackup(data);
  return data;
});
ipcMain.handle('save-data', (_event, data: AppData) => {
  saveData(data);
  return { ok: true };
});
ipcMain.handle('export-csv', () => exportCSV());
ipcMain.handle('backup-data', () => backupData());
ipcMain.handle('restore-data', () => restoreData());
ipcMain.handle('fetch-rates', () => fetchRates());
ipcMain.handle('export-pdf', (_event, payload: PdfReportPayload) => exportPDF(payload));
ipcMain.handle(
  'export-chart-png',
  (_event, rect: { x: number; y: number; width: number; height: number }, suggestedName: string) =>
    exportChartPNG(rect, suggestedName)
);
ipcMain.handle('open-external', (_event, url: string) => shell.openExternal(url));

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', flushPendingSave);

// `npm run dev` restarts (Ctrl+C, nodemon-style relaunch) kill this process via a
// signal rather than Electron's normal quit flow, which skips 'before-quit' — flush
// here too so an in-flight debounced save isn't lost.
process.on('SIGINT', () => {
  flushPendingSave();
  app.quit();
});
process.on('SIGTERM', () => {
  flushPendingSave();
  app.quit();
});
