import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useStore } from '@/store';
import { ChartWidgetCard } from './ChartWidgetCard';
import { ChartGalleryModal } from './ChartGalleryModal';
import { useT } from '@/shared/i18n';
import type { ChartWidget } from '@/types';

export function Analytics() {
  const chartWidgets = useStore((s) => s.chartWidgets);
  const deleteChartWidget = useStore((s) => s.deleteChartWidget);
  const { t } = useT();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<ChartWidget | null>(null);

  function openCreate() {
    setEditingWidget(null);
    setGalleryOpen(true);
  }

  function openEdit(widget: ChartWidget) {
    setEditingWidget(widget);
    setGalleryOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('analytics_title')}</h1>
        {chartWidgets.length > 0 && (
          <Button onClick={openCreate}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} /> {t('analytics_addChart')}
            </span>
          </Button>
        )}
      </div>

      {chartWidgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-[var(--text-2)]">
          <span className="text-sm">{t('analytics_noCharts')}</span>
          <button
            onClick={openCreate}
            className="w-14 h-14 rounded-full bg-[var(--blue)] text-white flex items-center justify-center hover:opacity-90 transition"
          >
            <Plus size={24} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chartWidgets.map((w) => (
            <div key={w.id} className={w.visual === 'table' ? 'lg:col-span-2' : ''}>
              <ChartWidgetCard
                widget={w}
                onEdit={() => openEdit(w)}
                onDelete={() => deleteChartWidget(w.id)}
              />
            </div>
          ))}
        </div>
      )}

      <ChartGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        editingWidget={editingWidget}
      />
    </div>
  );
}
