import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { CurrencyPicker } from '@/shared/components/CurrencyPicker';
import { useStore } from '@/store';
import { platform } from '@/shared/platform';
import { useT } from '@/shared/i18n';
import type { Currency } from '@/types';

export function CurrenciesSection() {
  const updateRates = useStore((s) => s.updateRates);
  const defaultCurrency = useStore((s) => s.settings.defaultCurrency);
  const setDefaultCurrency = useStore((s) => s.setDefaultCurrency);
  const autoImportRates = useStore((s) => s.settings.autoImportRates);
  const setAutoImportRates = useStore((s) => s.setAutoImportRates);
  const { t } = useT();
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleImport() {
    setImporting(true);
    setImportMsg(null);
    const result = await platform.fetchRates();
    setImporting(false);
    if (result.ok) {
      updateRates(result.rates);
      setImportMsg({ ok: true, text: t('settings_importSuccess') });
    } else {
      setImportMsg({ ok: false, text: result.error });
    }
    setTimeout(() => setImportMsg(null), 3000);
  }

  return (
    <Card>
      <h3 className="text-sm font-medium mb-3">{t('settings_currencies')}</h3>

      <CurrencyPicker
        label={t('settings_defaultCurrency')}
        value={defaultCurrency}
        onChange={(code) => setDefaultCurrency(code as Currency)}
        className="mb-3 max-w-xs"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" onClick={handleImport} disabled={importing}>
          <span className="flex items-center gap-1.5">
            <Download size={14} /> {importing ? t('settings_importing') : t('settings_importRates')}
          </span>
        </Button>
        {importMsg && (
          <span
            className={`text-xs ${importMsg.ok ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}
          >
            {importMsg.text}
          </span>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--text-2)] mt-3">
        <input
          type="checkbox"
          checked={autoImportRates}
          onChange={(e) => setAutoImportRates(e.target.checked)}
          className="accent-[var(--blue)]"
        />
        {t('settings_autoImport')}
      </label>
    </Card>
  );
}
