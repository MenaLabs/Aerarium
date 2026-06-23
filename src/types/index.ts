export type Currency = string;
export type AccountType = 'card' | 'cash' | 'savings';
export type TxType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense';
export type Theme = 'dark' | 'light';
export type Locale = 'en' | 'uk';
export type NavPage =
  | 'dashboard'
  | 'transactions'
  | 'accounts'
  | 'budget'
  | 'analytics'
  | 'settings';

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  type: AccountType;
  balance: number;
  color: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  isOther?: boolean;
  isDefault?: boolean;
  parentId?: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  currency: Currency;
  categoryId: string;
  accountId: string;
  description: string;
  date: string; // YYYY-MM-DD
  isPlanned: boolean;
  createdAt: string;
  recurringId?: string;
}

export interface Budget {
  id: string;
  month: string; // YYYY-MM
  categoryId: string;
  amountUAH?: number;
  percent?: number; // % of the expected monthly budget for that month, alternative to amountUAH
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number; // deducted from source, in source account's currency
  toAmount: number; // credited to destination, in destination account's currency
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: string;
}

export type RecurFrequency = 'weekly' | 'monthly';

export interface RecurringRule {
  id: string;
  type: TxType;
  amount: number;
  currency: Currency;
  categoryId: string;
  accountId: string;
  description: string;
  frequency: RecurFrequency;
  dayOfMonth?: number; // 1-28, used when frequency === 'monthly'
  weekday?: number; // 0 (Sun) - 6 (Sat), used when frequency === 'weekly'
  active: boolean;
  createdAt: string;
}

export interface Settings {
  rates: Record<string, number>; // UAH per 1 unit of the currency (UAH itself omitted, implicitly 1)
  defaultCurrency: Currency;
  theme: Theme;
  autoImportRates: boolean;
  locale: Locale;
  autoBackupEnabled?: boolean; // defaults to true when unset
  lastAutoBackupAt?: string;
}

export type ChartVisual = 'line' | 'bar' | 'pie' | 'table';
export type ChartMetric =
  | 'balance'
  | 'balanceProjection'
  | 'incomeExpense'
  | 'categoryBreakdown'
  | 'categoryCompare'
  | 'topCategories'
  | 'singleCategoryTrend';
export type ChartPeriod = 'month' | 'quarter' | 'year';

export interface ChartWidget {
  id: string;
  title: string;
  metric: ChartMetric;
  visual: ChartVisual;
  period: ChartPeriod;
  categoryId?: string;
  accountId?: string;
  currency?: Currency;
  createdAt: string;
}

export interface PdfReportRow {
  date: string;
  category: string;
  account: string;
  description: string;
  amount: string;
}

export interface PdfReportPayload {
  title: string;
  rows: PdfReportRow[];
}

export interface AppData {
  version: string;
  schemaVersion?: number; // data-shape version, drives the migration pipeline
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  monthlyBudgets?: Record<string, number>; // month "YYYY-MM" -> expected total spend (UAH)
  transfers: Transfer[];
  recurringRules: RecurringRule[];
  chartWidgets: ChartWidget[];
  settings: Settings;
  updatedAt?: string; // ISO timestamp of last local save
}
