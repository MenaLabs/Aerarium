import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { CURRENCIES, currencyName } from '@/shared/utils/currencies';
import { useT } from '@/shared/i18n';

interface CurrencyPickerProps {
  label?: string;
  value: string;
  onChange: (code: string) => void;
  allowEmpty?: string;
  className?: string;
}

export function CurrencyPicker({ label, value, onChange, allowEmpty, className = '' }: CurrencyPickerProps) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameUk.toLowerCase().includes(q)
    );
  }, [query]);

  const fiatResults = filtered.filter((c) => c.kind === 'fiat');
  const cryptoResults = filtered.filter((c) => c.kind === 'crypto');

  const selectedLabel =
    value === '' && allowEmpty
      ? allowEmpty
      : value
        ? `${value} — ${currencyName(value, locale)}`
        : '';

  function select(code: string) {
    onChange(code);
    setOpen(false);
  }

  return (
    <div className={`flex flex-col gap-1 relative ${className}`} ref={ref}>
      {label && <span className="text-xs text-[var(--text-2)]">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-[var(--bg-base)] border border-[var(--border)] focus:border-[var(--blue)] rounded-lg px-3 py-2 text-sm outline-none text-[var(--text-1)] flex items-center justify-between gap-2"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={14} className="text-[var(--text-2)] flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl w-72 max-h-80 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
            <Search size={14} className="text-[var(--text-2)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-[var(--text-1)]"
            />
          </div>
          <div className="overflow-y-auto py-1">
            {allowEmpty && !query && (
              <button
                type="button"
                onClick={() => select('')}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-hover)] transition ${
                  value === '' ? 'text-[var(--blue)]' : 'text-[var(--text-1)]'
                }`}
              >
                {allowEmpty}
              </button>
            )}
            {fiatResults.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => select(c.code)}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-hover)] transition flex items-center justify-between gap-2 ${
                  value === c.code ? 'text-[var(--blue)]' : 'text-[var(--text-1)]'
                }`}
              >
                <span className="truncate">{locale === 'uk' ? c.nameUk : c.nameEn}</span>
                <span className="text-xs text-[var(--text-2)] flex-shrink-0">{c.code}</span>
              </button>
            ))}
            {cryptoResults.length > 0 && (
              <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-[var(--text-2)]">
                {t('currencyPicker_crypto')}
              </div>
            )}
            {cryptoResults.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => select(c.code)}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-hover)] transition flex items-center justify-between gap-2 ${
                  value === c.code ? 'text-[var(--blue)]' : 'text-[var(--text-1)]'
                }`}
              >
                <span className="truncate">{locale === 'uk' ? c.nameUk : c.nameEn}</span>
                <span className="text-xs text-[var(--text-2)] flex-shrink-0">{c.code}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-sm text-[var(--text-2)] text-center">
                {t('currencyPicker_noResults')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
