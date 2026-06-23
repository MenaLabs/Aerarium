import { useStore } from '@/store';
import { en, type TranslationKey } from './en';
import { uk } from './uk';

const DICTS = { en, uk };

export function useT() {
  const locale = useStore((s) => s.settings.locale);
  const dict = DICTS[locale] ?? en;

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text = dict[key] ?? en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return { t, locale };
}

export type { TranslationKey } from './en';
