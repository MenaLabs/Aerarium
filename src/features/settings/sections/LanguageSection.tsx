import { Card } from '@/shared/components/Card';
import { Select } from '@/shared/components/Select';
import { useStore } from '@/store';
import { useT } from '@/shared/i18n';
import type { Locale } from '@/types';

export function LanguageSection() {
  const locale = useStore((s) => s.settings.locale);
  const setLocale = useStore((s) => s.setLocale);
  const { t } = useT();

  return (
    <Card>
      <h3 className="text-sm font-medium mb-3">{t('settings_language')}</h3>
      <Select
        label={t('settings_languageLabel')}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        options={[
          { value: 'en', label: 'English' },
          { value: 'uk', label: 'Українська' },
        ]}
        className="max-w-xs"
      />
    </Card>
  );
}
