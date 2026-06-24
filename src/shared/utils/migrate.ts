import type { AppData, BudgetPeriod } from '../../types';
import { DEFAULT_DATA } from './defaultData';

// Consumed by both the renderer (path-aliased) and electron/main.ts (no alias),
// so this file uses relative imports only.

const DEFAULT_CATEGORY_BY_ID = new Map(DEFAULT_DATA.categories.map((c) => [c.id, c]));

function migrateCategories(data: AppData): AppData {
  const needsMigration = data.categories.some((c) => {
    const seed = DEFAULT_CATEGORY_BY_ID.get(c.id);
    return seed && (!c.isDefault || (seed.isOther && !c.isOther));
  });
  if (!needsMigration) return data;
  return {
    ...data,
    categories: data.categories.map((c) => {
      const seed = DEFAULT_CATEGORY_BY_ID.get(c.id);
      if (!seed) return c;
      return { ...c, isDefault: true, ...(seed.isOther ? { isOther: true } : {}) };
    }),
  };
}

// Ordered, one-way migrations. Index i upgrades data from schema version i to
// i+1. Append new entries when a future release changes the data shape; never
// reorder or remove existing ones.
const MIGRATIONS: Array<(data: AppData) => AppData> = [
  // v0 -> v1: baseline. Field defaults are handled idempotently by normalize().
  (data) => data,
  // v1 -> v2: budgets become recurring (period-based) instead of per-month.
  (data) => {
    const d = { ...data } as AppData & {
      budgets?: Array<{
        id: string;
        categoryId: string;
        month?: string;
        amountUAH?: number;
        percent?: number;
        period?: string;
      }>;
    };
    // Seed the recurring expected budget from the most recent monthly override.
    const overrides = d.monthlyBudgets ?? {};
    if (!d.expectedBudget) {
      const months = Object.keys(overrides).sort();
      if (months.length > 0) {
        d.expectedBudget = { amount: overrides[months[months.length - 1]], period: 'month' };
      }
    }
    // Collapse any per-month category budgets to a single recurring one per
    // category (keep the latest month's value), tagged as a monthly period.
    if (Array.isArray(d.budgets)) {
      const byCategory = new Map<string, (typeof d.budgets)[number]>();
      for (const b of d.budgets) {
        const prev = byCategory.get(b.categoryId);
        if (!prev || (b.month ?? '') >= (prev.month ?? '')) byCategory.set(b.categoryId, b);
      }
      d.budgets = Array.from(byCategory.values()).map((b) => ({
        id: b.id,
        categoryId: b.categoryId,
        amountUAH: b.amountUAH,
        percent: b.percent,
        period: (b.period as BudgetPeriod) ?? 'month',
      }));
    }
    return d as AppData;
  },
  // v2 -> v3: introduce named themes; seed from the old dark/light flag.
  (data) => {
    const d = { ...data };
    if (d.settings && !d.settings.themeId) {
      d.settings = { ...d.settings, themeId: d.settings.theme === 'light' ? 'light' : 'vault' };
    }
    return d;
  },
];

export const SCHEMA_VERSION = MIGRATIONS.length;

// Idempotent: fills in any missing fields and applies fixups that must hold for
// every load regardless of version. Safe to run repeatedly.
function normalize(data: AppData): AppData {
  const d: AppData = { ...data };
  d.accounts ??= [];
  d.transactions ??= [];
  d.categories ??= DEFAULT_DATA.categories;
  d.budgets ??= [];
  d.monthlyBudgets ??= {};
  d.transfers ??= [];
  d.recurringRules ??= [];
  d.chartWidgets ??= [];
  d.settings ??= { ...DEFAULT_DATA.settings };
  if (d.settings.autoImportRates === undefined) d.settings.autoImportRates = false;
  if (!d.settings.locale) d.settings.locale = 'uk';
  if (!d.settings.themeId) d.settings.themeId = d.settings.theme === 'light' ? 'light' : 'vault';
  return migrateCategories(d);
}

// Single entry point: brings any older/partial save up to the current shape.
export function migrateAppData(data: AppData): AppData {
  let d = data;
  const from = d.schemaVersion ?? 0;
  for (let i = from; i < MIGRATIONS.length; i++) {
    d = MIGRATIONS[i](d);
  }
  d = normalize(d);
  d.schemaVersion = SCHEMA_VERSION;
  return d;
}
