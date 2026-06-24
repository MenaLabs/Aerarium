import { useEffect, useState } from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { platform } from '@/shared/platform';
import { useT } from '@/shared/i18n';

interface UpdateInfo {
  version: string;
  notes: string;
  url: string;
}

export function UpdateChecker({ collapsed }: { collapsed?: boolean }) {
  const { t } = useT();
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    platform
      .checkForUpdate(__APP_VERSION__)
      .then((r) => {
        if (!cancelled && r.update) {
          setInfo({ version: r.version, notes: r.notes, url: r.url });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`border-t border-[var(--border)] flex flex-col ${
        collapsed ? 'items-center gap-1 px-2 py-3' : 'items-start gap-1.5 px-4 py-3'
      }`}
    >
      {info &&
        (collapsed ? (
          <button
            onClick={() => setOpen(true)}
            title={t('update_available')}
            className="text-[var(--blue)] hover:opacity-80"
          >
            <ArrowUpCircle size={16} />
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--blue)] hover:opacity-80"
          >
            <ArrowUpCircle size={13} /> {t('update_available')}
          </button>
        ))}
      <span className="text-[11px] text-[var(--text-3)]">v{__APP_VERSION__}</span>

      <Modal open={open} onClose={() => setOpen(false)} title={t('update_title')}>
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">v{info?.version}</div>
          {info?.notes && (
            <div className="text-xs text-[var(--text-2)] whitespace-pre-wrap max-h-64 overflow-y-auto border border-[var(--border)] rounded-lg p-3">
              {info.notes}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common_cancel')}
            </Button>
            <Button
              onClick={() => {
                if (info) platform.openExternal(info.url);
                setOpen(false);
              }}
            >
              {t('update_btn')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
