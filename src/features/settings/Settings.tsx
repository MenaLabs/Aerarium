import { useT } from '@/shared/i18n';
import { ThemeSection } from './sections/ThemeSection';
import { LanguageSection } from './sections/LanguageSection';
import { CurrenciesSection } from './sections/CurrenciesSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { DataSection } from './sections/DataSection';
import { DonationSection } from './sections/DonationSection';

export function Settings() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">{t('settings_title')}</h1>
      <ThemeSection />
      <LanguageSection />
      <CurrenciesSection />
      <CategoriesSection />
      <DonationSection />
      <DataSection />
      <div className="text-center text-xs text-[var(--text-2)] pt-2">
        {t('appName')} v{__APP_VERSION__}
      </div>
    </div>
  );
}
