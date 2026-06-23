import { en } from '../i18n/en';
import { uk } from '../i18n/uk';
import type { Locale } from '../../types';

const DICTS = { en, uk };

// Default (seeded) categories have a stable id, so their display name can be
// translated even though `category.name` itself stays a fixed English string
// (custom user-created categories have no entry here and just show `.name`).
const DEFAULT_CATEGORY_KEYS: Record<string, keyof typeof en> = {
  c1: 'category_salary',
  c2: 'category_freelance',
  c3: 'category_otherIncome',
  c4: 'category_foodDining',
  c5: 'category_transport',
  c6: 'category_utilities',
  c7: 'category_entertainment',
  c8: 'category_health',
  c9: 'category_clothing',
  c10: 'category_education',
  c11: 'category_subscriptions',
  c12: 'category_other',
};

export function categoryDisplayName(
  category: { id: string; name: string } | undefined | null,
  locale: Locale
): string | undefined {
  if (!category) return undefined;
  const key = DEFAULT_CATEGORY_KEYS[category.id];
  if (!key) return category.name;
  const dict = DICTS[locale] ?? en;
  return dict[key] ?? en[key] ?? category.name;
}
