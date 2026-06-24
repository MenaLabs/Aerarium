import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  CalendarDays,
  TrendingUp,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store';
import { useT } from '@/shared/i18n';
import type { NavPage } from '@/types';
import { Dashboard } from '@/features/dashboard';
import { Toast } from '@/shared/components/Toast';
import { platform } from '@/shared/platform';
import { OnboardingScreen } from '@/shared/components/OnboardingScreen';
import { applyTheme } from '@/shared/utils/themes';

const Transactions = lazy(() =>
  import('@/features/transactions').then((m) => ({ default: m.Transactions }))
);
const Accounts = lazy(() => import('@/features/accounts').then((m) => ({ default: m.Accounts })));
const Budget = lazy(() => import('@/features/budget').then((m) => ({ default: m.Budget })));
const Settings = lazy(() => import('@/features/settings').then((m) => ({ default: m.Settings })));
const Analytics = lazy(() =>
  import('@/features/analytics').then((m) => ({ default: m.Analytics }))
);

const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard },
  { id: 'transactions', labelKey: 'nav_transactions', icon: ArrowLeftRight },
  { id: 'accounts', labelKey: 'nav_accounts', icon: Wallet },
  { id: 'budget', labelKey: 'nav_budget', icon: CalendarDays },
  { id: 'analytics', labelKey: 'nav_analytics', icon: TrendingUp },
  { id: 'settings', labelKey: 'nav_settings', icon: SettingsIcon },
] as const;

const PAGES: Record<NavPage, ComponentType> = {
  dashboard: Dashboard,
  transactions: Transactions,
  accounts: Accounts,
  budget: Budget,
  analytics: Analytics,
  settings: Settings,
};

const COLLAPSE_KEY = 'aerarium:sidebar-collapsed';

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  const isLoaded = useStore((s) => s.isLoaded);
  const page = useStore((s) => s.page);
  const setPage = useStore((s) => s.setPage);
  const showOnboarding = useStore((s) => s.showOnboarding);
  const setShowOnboarding = useStore((s) => s.setShowOnboarding);
  const themeId = useStore((s) => s.settings.themeId);
  const { t } = useT();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    platform.loadData().then((data) => {
      setShowOnboarding(!data.updatedAt);
      hydrate(data);
      useStore.getState().generateDueTransactions();
      if (data.settings.autoImportRates) {
        platform.fetchRates().then((result) => {
          if (result.ok) useStore.getState().updateRates(result.rates);
        });
      }
    });
  }, [hydrate]);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-base)] text-[var(--text-2)]">
        {t('loading')}
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  const Page = PAGES[page];
  const currentLabel = t(NAV_ITEMS.find((item) => item.id === page)?.labelKey ?? 'nav_dashboard');

  return (
    <div className="h-full flex flex-col md:flex-row bg-[var(--bg-base)] text-[var(--text-1)]">
      <aside
        className={`hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200 ${
          collapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
          {!collapsed && (
            <span className="font-semibold text-sm bg-[image:var(--accent-gradient)] bg-clip-text text-transparent">
              {t('appName')}
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-[var(--text-2)] hover:text-[var(--text-1)]"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            const label = t(item.labelKey);
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition ${
                  active
                    ? 'bg-[image:var(--accent-gradient)] text-[var(--on-accent)]'
                    : 'text-[var(--text-2)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-1)]'
                }`}
              >
                <Icon size={16} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-surface)] flex-shrink-0">
        <span className="font-semibold text-sm bg-[image:var(--accent-gradient)] bg-clip-text text-transparent">
          {t('appName')}
        </span>
        <span className="text-sm text-[var(--text-2)]">{currentLabel}</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        <Suspense fallback={<div className="text-sm text-[var(--text-2)]">{t('loading')}</div>}>
          <Page />
        </Suspense>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t border-[var(--border)] bg-[var(--bg-surface)] z-40">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition ${
                active ? 'text-[var(--blue)]' : 'text-[var(--text-2)]'
              }`}
            >
              <Icon size={18} />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
}
