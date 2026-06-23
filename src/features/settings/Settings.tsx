import { useState, type ReactNode } from 'react';
import { Plus, X, Download, ChevronRight, ChevronDown, Heart } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useStore } from '@/store';
import { useToastStore } from '@/store/toastStore';
import { DEFAULT_DATA } from '@/shared/utils/defaultData';
import { persist } from '@/store';
import { PALETTE } from '@/shared/utils/palette';
import { platform } from '@/shared/platform';
import { useT } from '@/shared/i18n';
import { CurrencyPicker } from '@/shared/components/CurrencyPicker';
import { MONOBANK_JAR_URL, KOFI_URL, CRYPTO_DONATION_ADDRESS } from '@/shared/utils/donationLinks';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import type { Category, CategoryType, Currency, Locale } from '@/types';

function LanguageSection() {
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

function CurrenciesSection() {
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

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
}

function AddCategoryModal({ open, onClose }: AddCategoryModalProps) {
  const addCategory = useStore((s) => s.addCategory);
  const { t } = useT();
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [color, setColor] = useState(PALETTE[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory({ name: name.trim(), type, color });
    setName('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t('txForm_newCategoryTitle')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label={t('common_name')} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Select
          label={t('common_type')}
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          options={[
            { value: 'expense', label: t('common_expense') },
            { value: 'income', label: t('common_income') },
          ]}
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-2)]">{t('common_color')}</span>
          <div className="flex gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-surface)] ring-white' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common_cancel')}
          </Button>
          <Button type="submit">{t('common_save')}</Button>
        </div>
      </form>
    </Modal>
  );
}

interface CategoryRowProps {
  category: Category;
  inUse: boolean;
  blockedReason: 'in-use' | 'default' | null;
  onDelete: () => void;
  indent?: boolean;
  trailing?: ReactNode;
}

function CategoryRow({
  category,
  inUse,
  blockedReason,
  onDelete,
  indent,
  trailing,
}: CategoryRowProps) {
  const { t, locale } = useT();
  const disabled = inUse || category.isDefault;
  return (
    <div
      className={`flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg hover:bg-[var(--bg-hover)] ${
        indent ? 'ml-5' : ''
      }`}
    >
      <div className="flex items-center gap-2 text-sm min-w-0">
        {trailing}
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <span className="truncate">{categoryDisplayName(category, locale)}</span>
        <span className="text-[11px] text-[var(--text-2)] flex-shrink-0">
          {category.type === 'income' ? t('common_income') : t('common_expense')}
        </span>
      </div>
      {blockedReason ? (
        <span className="text-[11px] text-[var(--amber)] flex-shrink-0">
          {blockedReason === 'default' ? t('settings_defaultCategory') : t('settings_inUse')}
        </span>
      ) : (
        <button
          onClick={onDelete}
          disabled={disabled}
          title={
            category.isDefault
              ? t('settings_cannotDeleteDefault')
              : inUse
                ? t('settings_inUseTooltip')
                : undefined
          }
          className="text-[var(--text-2)] hover:text-[var(--red)] disabled:opacity-30 disabled:hover:text-[var(--text-2)] transition flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function CategoriesSection() {
  const categories = useStore((s) => s.categories);
  const transactions = useStore((s) => s.transactions);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const restoreCategory = useStore((s) => s.restoreCategory);
  const showToast = useToastStore((s) => s.show);
  const { t } = useT();
  const [modalOpen, setModalOpen] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState<{ id: string; reason: 'in-use' | 'default' } | null>(
    null
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function handleDelete(category: Category) {
    const result = deleteCategory(category.id);
    if (result === 'ok') {
      showToast(t('settings_categoryDeletedToast'), () => restoreCategory(category));
    } else {
      setBlockedInfo({ id: category.id, reason: result });
      setTimeout(() => setBlockedInfo(null), 2000);
    }
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const inUse = new Set(transactions.map((tx) => tx.categoryId));
  const topLevel = categories.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, Category[]>();
  for (const c of categories) {
    if (!c.parentId) continue;
    const list = childrenByParent.get(c.parentId) ?? [];
    list.push(c);
    childrenByParent.set(c.parentId, list);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{t('settings_categories')}</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="text-[var(--blue)] hover:opacity-80"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {topLevel.map((c) => {
          const children = childrenByParent.get(c.id) ?? [];
          const isExpanded = expanded.has(c.id);
          return (
            <div key={c.id}>
              <CategoryRow
                category={c}
                inUse={inUse.has(c.id)}
                blockedReason={blockedInfo?.id === c.id ? blockedInfo.reason : null}
                onDelete={() => handleDelete(c)}
                trailing={
                  c.isOther && children.length > 0 ? (
                    <button
                      onClick={() => toggleExpanded(c.id)}
                      className="text-[var(--text-2)] hover:text-[var(--text-1)] flex-shrink-0"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  ) : (
                    <span className="w-3.5 flex-shrink-0" />
                  )
                }
              />
              {c.isOther && isExpanded && (
                <div className="flex flex-col gap-1.5 mt-1">
                  {children.map((child) => (
                    <CategoryRow
                      key={child.id}
                      category={child}
                      inUse={inUse.has(child.id)}
                      blockedReason={blockedInfo?.id === child.id ? blockedInfo.reason : null}
                      onDelete={() => handleDelete(child)}
                      indent
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <AddCategoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Card>
  );
}

function DataSection() {
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

function DonationSection() {
  const { t } = useT();
  const links = [
    { url: MONOBANK_JAR_URL, label: t('donations_monobank') },
    { url: KOFI_URL, label: t('donations_kofi') },
    { url: CRYPTO_DONATION_ADDRESS, label: t('donations_crypto') },
  ].filter((link) => link.url);

  if (links.length === 0) return null;

  return (
    <Card>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
        <Heart size={14} className="text-[var(--red)]" /> {t('donations_title')}
      </h3>
      <p className="text-xs text-[var(--text-2)] mb-3">{t('donations_description')}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {links.map((link) => (
          <Button key={link.label} variant="ghost" onClick={() => platform.openExternal(link.url)}>
            {link.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}

export function Settings() {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">{t('settings_title')}</h1>
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
