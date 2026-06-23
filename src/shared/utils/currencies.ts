export type CurrencyKind = 'fiat' | 'crypto';

export interface CurrencyMeta {
  code: string;
  symbol: string;
  nameEn: string;
  nameUk: string;
  kind: CurrencyKind;
  coingeckoId?: string;
  decimals: number;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: 'UAH', symbol: '₴', nameEn: 'Ukrainian Hryvnia', nameUk: 'Українська гривня', kind: 'fiat', decimals: 2 },
  { code: 'USD', symbol: '$', nameEn: 'US Dollar', nameUk: 'Долар США', kind: 'fiat', decimals: 2 },
  { code: 'EUR', symbol: '€', nameEn: 'Euro', nameUk: 'Євро', kind: 'fiat', decimals: 2 },
  { code: 'GBP', symbol: '£', nameEn: 'British Pound', nameUk: 'Британський фунт', kind: 'fiat', decimals: 2 },
  { code: 'PLN', symbol: 'zł', nameEn: 'Polish Zloty', nameUk: 'Польський злотий', kind: 'fiat', decimals: 2 },
  { code: 'CHF', symbol: 'CHF', nameEn: 'Swiss Franc', nameUk: 'Швейцарський франк', kind: 'fiat', decimals: 2 },
  { code: 'CZK', symbol: 'Kč', nameEn: 'Czech Koruna', nameUk: 'Чеська крона', kind: 'fiat', decimals: 2 },
  { code: 'JPY', symbol: '¥', nameEn: 'Japanese Yen', nameUk: 'Японська єна', kind: 'fiat', decimals: 0 },
  { code: 'CNY', symbol: '¥', nameEn: 'Chinese Yuan', nameUk: 'Китайський юань', kind: 'fiat', decimals: 2 },
  { code: 'CAD', symbol: 'CA$', nameEn: 'Canadian Dollar', nameUk: 'Канадський долар', kind: 'fiat', decimals: 2 },
  { code: 'AUD', symbol: 'A$', nameEn: 'Australian Dollar', nameUk: 'Австралійський долар', kind: 'fiat', decimals: 2 },
  { code: 'TRY', symbol: '₺', nameEn: 'Turkish Lira', nameUk: 'Турецька ліра', kind: 'fiat', decimals: 2 },
  { code: 'SEK', symbol: 'kr', nameEn: 'Swedish Krona', nameUk: 'Шведська крона', kind: 'fiat', decimals: 2 },
  { code: 'NOK', symbol: 'kr', nameEn: 'Norwegian Krone', nameUk: 'Норвезька крона', kind: 'fiat', decimals: 2 },
  { code: 'DKK', symbol: 'kr', nameEn: 'Danish Krone', nameUk: 'Данська крона', kind: 'fiat', decimals: 2 },
  { code: 'HUF', symbol: 'Ft', nameEn: 'Hungarian Forint', nameUk: 'Угорський форинт', kind: 'fiat', decimals: 0 },
  { code: 'RON', symbol: 'lei', nameEn: 'Romanian Leu', nameUk: 'Румунський лей', kind: 'fiat', decimals: 2 },
  { code: 'BGN', symbol: 'лв', nameEn: 'Bulgarian Lev', nameUk: 'Болгарський лев', kind: 'fiat', decimals: 2 },
  { code: 'ILS', symbol: '₪', nameEn: 'Israeli Shekel', nameUk: 'Ізраїльський шекель', kind: 'fiat', decimals: 2 },
  { code: 'INR', symbol: '₹', nameEn: 'Indian Rupee', nameUk: 'Індійська рупія', kind: 'fiat', decimals: 2 },
  { code: 'KRW', symbol: '₩', nameEn: 'South Korean Won', nameUk: 'Південнокорейська вона', kind: 'fiat', decimals: 0 },
  { code: 'SGD', symbol: 'S$', nameEn: 'Singapore Dollar', nameUk: 'Сінгапурський долар', kind: 'fiat', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', nameEn: 'Hong Kong Dollar', nameUk: 'Гонконгський долар', kind: 'fiat', decimals: 2 },
  { code: 'NZD', symbol: 'NZ$', nameEn: 'New Zealand Dollar', nameUk: 'Новозеландський долар', kind: 'fiat', decimals: 2 },
  { code: 'MXN', symbol: 'MX$', nameEn: 'Mexican Peso', nameUk: 'Мексиканське песо', kind: 'fiat', decimals: 2 },
  { code: 'ZAR', symbol: 'R', nameEn: 'South African Rand', nameUk: 'Південноафриканський ранд', kind: 'fiat', decimals: 2 },
  { code: 'BRL', symbol: 'R$', nameEn: 'Brazilian Real', nameUk: 'Бразильський реал', kind: 'fiat', decimals: 2 },
  { code: 'MYR', symbol: 'RM', nameEn: 'Malaysian Ringgit', nameUk: 'Малайзійський рингіт', kind: 'fiat', decimals: 2 },
  { code: 'THB', symbol: '฿', nameEn: 'Thai Baht', nameUk: 'Тайський бат', kind: 'fiat', decimals: 2 },
  { code: 'IDR', symbol: 'Rp', nameEn: 'Indonesian Rupiah', nameUk: 'Індонезійська рупія', kind: 'fiat', decimals: 0 },
  { code: 'PHP', symbol: '₱', nameEn: 'Philippine Peso', nameUk: 'Філіппінське песо', kind: 'fiat', decimals: 2 },
  { code: 'ISK', symbol: 'kr', nameEn: 'Icelandic Krona', nameUk: 'Ісландська крона', kind: 'fiat', decimals: 0 },

  { code: 'BTC', symbol: '₿', nameEn: 'Bitcoin', nameUk: 'Біткоїн', kind: 'crypto', coingeckoId: 'bitcoin', decimals: 8 },
  { code: 'ETH', symbol: 'Ξ', nameEn: 'Ethereum', nameUk: 'Ефіріум', kind: 'crypto', coingeckoId: 'ethereum', decimals: 6 },
  { code: 'USDT', symbol: '₮', nameEn: 'Tether', nameUk: 'Тезер', kind: 'crypto', coingeckoId: 'tether', decimals: 2 },
  { code: 'BNB', symbol: 'BNB', nameEn: 'BNB', nameUk: 'BNB', kind: 'crypto', coingeckoId: 'bnb', decimals: 4 },
  { code: 'SOL', symbol: 'SOL', nameEn: 'Solana', nameUk: 'Солана', kind: 'crypto', coingeckoId: 'solana', decimals: 4 },
  { code: 'XRP', symbol: 'XRP', nameEn: 'XRP', nameUk: 'XRP', kind: 'crypto', coingeckoId: 'ripple', decimals: 4 },
  { code: 'USDC', symbol: '$', nameEn: 'USD Coin', nameUk: 'USD Coin', kind: 'crypto', coingeckoId: 'usd-coin', decimals: 2 },
  { code: 'DOGE', symbol: 'Ð', nameEn: 'Dogecoin', nameUk: 'Догкоїн', kind: 'crypto', coingeckoId: 'dogecoin', decimals: 4 },
  { code: 'ADA', symbol: 'ADA', nameEn: 'Cardano', nameUk: 'Кардано', kind: 'crypto', coingeckoId: 'cardano', decimals: 4 },
  { code: 'TRX', symbol: 'TRX', nameEn: 'TRON', nameUk: 'TRON', kind: 'crypto', coingeckoId: 'tron', decimals: 4 },
];

export const CURRENCY_BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export const FIAT_CURRENCIES = CURRENCIES.filter((c) => c.kind === 'fiat');
export const CRYPTO_CURRENCIES = CURRENCIES.filter((c) => c.kind === 'crypto');

export function getCurrencyMeta(code: string): CurrencyMeta | undefined {
  return CURRENCY_BY_CODE.get(code);
}

export function currencyName(code: string, locale: 'en' | 'uk'): string {
  const meta = getCurrencyMeta(code);
  if (!meta) return code;
  return locale === 'uk' ? meta.nameUk : meta.nameEn;
}

export function currencySymbol(code: string): string {
  return getCurrencyMeta(code)?.symbol ?? code;
}

export function currencyDecimals(code: string): number {
  return getCurrencyMeta(code)?.decimals ?? 2;
}
