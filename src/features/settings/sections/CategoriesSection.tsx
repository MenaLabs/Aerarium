import { useState, type ReactNode } from 'react';
import { Plus, X, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useStore } from '@/store';
import { useToastStore } from '@/store/toastStore';
import { PALETTE } from '@/shared/utils/palette';
import { useT } from '@/shared/i18n';
import { categoryDisplayName } from '@/shared/utils/categoryName';
import type { Category, CategoryType } from '@/types';

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

export function CategoriesSection() {
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
