import type { StateCreator } from 'zustand';
import type { Category } from '@/types';
import { persist, type RootState } from '../index';
import { uid } from '@/shared/utils/dates';

export type DeleteCategoryResult = 'ok' | 'in-use' | 'default';

export interface CategoriesSlice {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id'>) => Category;
  deleteCategory: (id: string) => DeleteCategoryResult;
  restoreCategory: (category: Category) => void;
}

export const createCategoriesSlice: StateCreator<RootState, [], [], CategoriesSlice> = (
  set,
  get
) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (data) => {
    const category: Category = { id: uid(), ...data };
    set({ categories: [...get().categories, category] });
    persist(get);
    return category;
  },
  deleteCategory: (id) => {
    const category = get().categories.find((c) => c.id === id);
    if (!category) return 'ok';
    if (category.isDefault) return 'default';
    const inUse = get().transactions.some((t) => t.categoryId === id);
    if (inUse) return 'in-use';
    set({ categories: get().categories.filter((c) => c.id !== id) });
    persist(get);
    return 'ok';
  },
  restoreCategory: (category) => {
    if (get().categories.some((c) => c.id === category.id)) return;
    set({ categories: [...get().categories, category] });
    persist(get);
  },
});
