import { Undo2 } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useT } from '@/shared/i18n';

export function Toast() {
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);
  const { t } = useT();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4 min-w-[280px] overflow-hidden"
    >
      <span className="text-sm text-[var(--text-1)]">{toast.message}</span>
      <button
        onClick={() => {
          toast.onUndo();
          dismiss();
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--blue)] hover:opacity-80 flex-shrink-0"
      >
        <Undo2 size={14} /> {t('toast_undo')}
      </button>
      <div className="absolute bottom-0 left-0 h-0.5 bg-[var(--blue)] animate-toast-progress" />
    </div>
  );
}
