import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useStore } from '@/store';
import { useT } from '@/shared/i18n';
import { Card } from './Card';
import { Button } from './Button';
import { CurrencyPicker } from './CurrencyPicker';
import type { Locale } from '@/types';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const setDefaultCurrency = useStore((s) => s.setDefaultCurrency);
  const setLocale = useStore((s) => s.setLocale);
  const locale = useStore((s) => s.settings.locale);
  const accounts = useStore((s) => s.accounts);
  const updateAccount = useStore((s) => s.updateAccount);
  const { t } = useT();
  const [currency, setCurrency] = useState('USD');

  function selectLocale(value: Locale) {
    setLocale(value);
  }

  function handleContinue() {
    setDefaultCurrency(currency);
    for (const account of accounts) {
      updateAccount(account.id, { currency });
    }
    onComplete();
  }

  return (
    <div className="h-full flex items-center justify-center bg-[var(--bg-base)]">
      <Card className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-5">
          <Wallet size={28} className="text-[var(--blue)]" />
          <h1 className="text-sm font-medium text-center">{t('onboarding_title')}</h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--text-2)]">{t('onboarding_language')}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectLocale('en')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition border ${
                  locale === 'en'
                    ? 'bg-[var(--blue)] text-white border-[var(--blue)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-2)] border-[var(--border)]'
                }`}
              >
                <span className="text-lg leading-none">🇬🇧</span> English
              </button>
              <button
                type="button"
                onClick={() => selectLocale('uk')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition border ${
                  locale === 'uk'
                    ? 'bg-[var(--blue)] text-white border-[var(--blue)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-2)] border-[var(--border)]'
                }`}
              >
                <span className="text-lg leading-none">🇺🇦</span> Українська
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[var(--text-2)]">{t('onboarding_currency')}</span>
            <CurrencyPicker value={currency} onChange={setCurrency} />
          </div>

          <Button onClick={handleContinue}>{t('onboarding_continue')}</Button>
        </div>
      </Card>
    </div>
  );
}
