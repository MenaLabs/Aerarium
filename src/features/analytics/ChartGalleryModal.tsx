import { useEffect, useState } from 'react';
import {
  LineChart as LineIcon,
  BarChart3,
  PieChart as PieIcon,
  Table as TableIcon,
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from '@/shared/components/Modal';
import { Select } from '@/shared/components/Select';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { useStore } from '@/store';
import { useT, type TranslationKey } from '@/shared/i18n';
import { CurrencyPicker } from '@/shared/components/CurrencyPicker';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import type { ChartMetric, ChartPeriod, ChartVisual, ChartWidget, Currency } from '@/types';

interface Preset {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  metric: ChartMetric;
  visual: ChartVisual;
  period: ChartPeriod;
  icon: LucideIcon;
}

const PRESETS: Preset[] = [
  {
    titleKey: 'analytics_preset_balance_title',
    descKey: 'analytics_preset_balance_desc',
    metric: 'balance',
    visual: 'line',
    period: 'year',
    icon: LineIcon,
  },
  {
    titleKey: 'analytics_preset_projection_title',
    descKey: 'analytics_preset_projection_desc',
    metric: 'balanceProjection',
    visual: 'line',
    period: 'year',
    icon: TrendingUp,
  },
  {
    titleKey: 'analytics_preset_incomeExpense_title',
    descKey: 'analytics_preset_incomeExpense_desc',
    metric: 'incomeExpense',
    visual: 'bar',
    period: 'year',
    icon: BarChart3,
  },
  {
    titleKey: 'analytics_preset_categoryBreakdown_title',
    descKey: 'analytics_preset_categoryBreakdown_desc',
    metric: 'categoryBreakdown',
    visual: 'pie',
    period: 'month',
    icon: PieIcon,
  },
  {
    titleKey: 'analytics_preset_categoryCompare_title',
    descKey: 'analytics_preset_categoryCompare_desc',
    metric: 'categoryCompare',
    visual: 'bar',
    period: 'month',
    icon: BarChart3,
  },
  {
    titleKey: 'analytics_preset_topCategories_title',
    descKey: 'analytics_preset_topCategories_desc',
    metric: 'topCategories',
    visual: 'table',
    period: 'month',
    icon: TableIcon,
  },
];

const METRIC_LABEL_KEYS: Record<ChartMetric, TranslationKey> = {
  balance: 'analytics_metric_balance',
  balanceProjection: 'analytics_metric_balanceProjection',
  incomeExpense: 'analytics_metric_incomeExpense',
  categoryBreakdown: 'analytics_metric_categoryBreakdown',
  categoryCompare: 'analytics_metric_categoryCompare',
  topCategories: 'analytics_metric_topCategories',
  singleCategoryTrend: 'analytics_metric_singleCategoryTrend',
};

const METRIC_VISUALS: Record<ChartMetric, ChartVisual[]> = {
  balance: ['line', 'bar'],
  balanceProjection: ['line'],
  incomeExpense: ['bar'],
  categoryBreakdown: ['pie', 'bar'],
  categoryCompare: ['bar'],
  topCategories: ['table'],
  singleCategoryTrend: ['line', 'bar'],
};

const VISUAL_LABEL_KEYS: Record<ChartVisual, TranslationKey> = {
  line: 'analytics_visual_line',
  bar: 'analytics_visual_bar',
  pie: 'analytics_visual_pie',
  table: 'analytics_visual_table',
};

const PERIOD_LABEL_KEYS: Record<ChartPeriod, TranslationKey> = {
  month: 'analytics_period_month',
  quarter: 'analytics_period_quarter',
  year: 'analytics_period_year',
};

interface ChartGalleryModalProps {
  open: boolean;
  onClose: () => void;
  editingWidget?: ChartWidget | null;
}

export function ChartGalleryModal({ open, onClose, editingWidget }: ChartGalleryModalProps) {
  const addChartWidget = useStore((s) => s.addChartWidget);
  const updateChartWidget = useStore((s) => s.updateChartWidget);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const { t, locale } = useT();
  const isEditing = !!editingWidget;

  const [customOpen, setCustomOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState<ChartMetric>('balance');
  const [visual, setVisual] = useState<ChartVisual>('line');
  const [period, setPeriod] = useState<ChartPeriod>('year');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [accountId, setAccountId] = useState('');
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingWidget) {
      setCustomOpen(true);
      setTitle(editingWidget.title);
      setMetric(editingWidget.metric);
      setVisual(editingWidget.visual);
      setPeriod(editingWidget.period);
      setCategoryId(editingWidget.categoryId ?? categories[0]?.id ?? '');
      setAccountId(editingWidget.accountId ?? '');
      setCurrency(editingWidget.currency ?? '');
      setAdvancedOpen(!!(editingWidget.accountId || editingWidget.currency));
    } else {
      setCustomOpen(false);
      setAdvancedOpen(false);
      setTitle('');
      setMetric('balance');
      setVisual('line');
      setPeriod('year');
      setCategoryId(categories[0]?.id ?? '');
      setAccountId('');
      setCurrency('');
    }
  }, [open, editingWidget, categories]);

  function handleClose() {
    onClose();
  }

  function addPreset(p: Preset) {
    addChartWidget({ title: t(p.titleKey), metric: p.metric, visual: p.visual, period: p.period });
    handleClose();
  }

  function handleMetricChange(next: ChartMetric) {
    setMetric(next);
    const visuals = METRIC_VISUALS[next];
    if (!visuals.includes(visual)) setVisual(visuals[0]);
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (metric === 'singleCategoryTrend' && !categoryId) return;
    const data = {
      title: title.trim() || t(METRIC_LABEL_KEYS[metric]),
      metric,
      visual,
      period,
      categoryId: metric === 'singleCategoryTrend' ? categoryId : undefined,
      accountId: accountId || undefined,
      currency: (currency || undefined) as Currency | undefined,
    };
    if (editingWidget) {
      updateChartWidget(editingWidget.id, data);
    } else {
      addChartWidget(data);
    }
    handleClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? t('analytics_editChartTitle') : t('analytics_newChartTitle')}
      widthClass="max-w-lg"
    >
      {!customOpen ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.titleKey}
                  type="button"
                  onClick={() => addPreset(p)}
                  className="flex flex-col gap-2 items-start text-left p-3 rounded-xl border border-[var(--border)] hover:border-[var(--blue)] hover:bg-[var(--bg-hover)] transition"
                >
                  <Icon size={18} className="text-[var(--blue)]" />
                  <span className="text-sm font-medium">{t(p.titleKey)}</span>
                  <span className="text-xs text-[var(--text-2)]">{t(p.descKey)}</span>
                </button>
              );
            })}
          </div>
          <Button variant="ghost" onClick={() => setCustomOpen(true)}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} /> {t('analytics_createCustom')}
            </span>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
          <Input
            label={t('analytics_chartName')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(METRIC_LABEL_KEYS[metric])}
            autoFocus
          />
          <Select
            label={t('analytics_dataType')}
            value={metric}
            onChange={(e) => handleMetricChange(e.target.value as ChartMetric)}
            options={Object.entries(METRIC_LABEL_KEYS).map(([value, key]) => ({
              value,
              label: t(key as TranslationKey),
            }))}
          />
          {metric === 'singleCategoryTrend' && (
            <Select
              label={t('common_category')}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: categoryDisplayName(c, locale)! }))}
            />
          )}
          {METRIC_VISUALS[metric].length > 1 && (
            <Select
              label={t('analytics_visual')}
              value={visual}
              onChange={(e) => setVisual(e.target.value as ChartVisual)}
              options={METRIC_VISUALS[metric].map((v) => ({ value: v, label: t(VISUAL_LABEL_KEYS[v]) }))}
            />
          )}
          <Select
            label={t('analytics_period')}
            value={period}
            onChange={(e) => setPeriod(e.target.value as ChartPeriod)}
            options={Object.entries(PERIOD_LABEL_KEYS).map(([value, key]) => ({
              value,
              label: t(key as TranslationKey),
            }))}
          />

          <div className="border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="flex items-center gap-1.5 text-sm text-[var(--text-2)] hover:text-[var(--text-1)] transition"
            >
              {advancedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {t('analytics_advancedSettings')}
            </button>
            {advancedOpen && (
              <div className="flex flex-col gap-4 mt-3">
                <Select
                  label={t('common_account')}
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  options={[
                    { value: '', label: t('analytics_allAccounts') },
                    ...accounts.map((a) => ({ value: a.id, label: a.name })),
                  ]}
                />
                <CurrencyPicker
                  label={t('analytics_txCurrency')}
                  value={currency}
                  onChange={setCurrency}
                  allowEmpty={t('analytics_allCurrencies')}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={isEditing ? handleClose : () => setCustomOpen(false)}
            >
              {isEditing ? t('common_cancel') : t('analytics_back')}
            </Button>
            <Button type="submit">{isEditing ? t('common_save') : t('analytics_addChartBtn')}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
