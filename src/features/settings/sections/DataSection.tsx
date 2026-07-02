import { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useStore, persist } from '@/store';
import { DEFAULT_DATA } from '@/shared/utils/defaultData';
import { platform } from '@/shared/platform';
import { useT } from '@/shared/i18n';

export function DataSection() {
  const hydrate = useStore((s) => s.hydrate);
  const setShowOnboarding = useStore((s) => s.setShowOnboarding);
  const autoBackupEnabled = useStore((s) => s.settings.autoBackupEnabled !== false);
  const setAutoBackupEnabled = useStore((s) => s.setAutoBackupEnabled);
  const lastAutoBackupAt = useStore((s) => s.settings.lastAutoBackupAt);
  const { t } = useT();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [skipOnboardingAfterClear, setSkipOnboardingAfterClear] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleBackup() {
    const result = await platform.backupData();
    if (!result.canceled) {
      setMessage({ ok: true, text: t('settings_backupSaved') });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  async function handleRestore() {
    const result = await platform.restoreData();
    if (result.error) {
      setMessage({ ok: false, text: result.error });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (!result.canceled && result.data) {
      hydrate(result.data);
      setMessage({ ok: true, text: t('settings_dataRestored') });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  function handleClear() {
    hydrate(DEFAULT_DATA);
    persist(useStore.getState);
    setConfirmingClear(false);
    if (!skipOnboardingAfterClear) setShowOnboarding(true);
  }

  async function handleExportBeforeClear() {
    const result = await platform.backupData();
    if (!result.canceled) {
      setMessage({ ok: true, text: t('settings_backupSaved') });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  return (
    <Card>
      <h3 className="text-sm font-medium mb-3">{t('settings_data')}</h3>

      <label className="flex items-center gap-2 text-sm text-[var(--text-2)] mb-1">
        <input
          type="checkbox"
          checked={autoBackupEnabled}
          onChange={(e) => setAutoBackupEnabled(e.target.checked)}
          className="accent-[var(--blue)]"
        />
        {t('settings_autoBackup')}
      </label>
      <div className="text-xs text-[var(--text-2)] mb-3">
        {lastAutoBackupAt
          ? t('settings_lastAutoBackup', { time: new Date(lastAutoBackupAt).toLocaleString() })
          : t('settings_noAutoBackupYet')}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button variant="ghost" onClick={handleBackup}>
          {t('settings_backup')}
        </Button>
        <Button variant="ghost" onClick={handleRestore}>
          {t('settings_restore')}
        </Button>
        {message && (
          <span className={`text-xs ${message.ok ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {message.text}
          </span>
        )}
      </div>

      <div className="border border-[var(--red)]/40 rounded-xl p-4">
        <div className="text-xs text-[var(--red)] font-medium mb-2">{t('settings_dangerZone')}</div>
        <Button
          variant="danger"
          onClick={() => {
            setSkipOnboardingAfterClear(false);
            setConfirmingClear(true);
          }}
        >
          {t('settings_clearAll')}
        </Button>
      </div>

      <Modal
        open={confirmingClear}
        onClose={() => setConfirmingClear(false)}
        title={t('settings_confirmClearAllTitle')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-2)]">{t('settings_confirmClearAll')}</p>

          <Button variant="ghost" onClick={handleExportBeforeClear}>
            {t('settings_exportBeforeClear')}
          </Button>

          <label className="flex items-center gap-2 text-sm text-[var(--text-2)]">
            <input
              type="checkbox"
              checked={skipOnboardingAfterClear}
              onChange={(e) => setSkipOnboardingAfterClear(e.target.checked)}
              className="accent-[var(--blue)]"
            />
            {t('settings_skipOnboardingAfterClear')}
          </label>

          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" onClick={() => setConfirmingClear(false)}>
              {t('common_cancel')}
            </Button>
            <Button variant="danger" onClick={handleClear}>
              {t('settings_yesClear')}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
