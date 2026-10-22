import { create } from 'zustand';
import { CatalogCategory, CatalogItem } from '../../core/domain/entities';
import { catalogUseCases } from '../../infrastructure/di/container';
import { useAuthStore } from './useAuthStore';
import { useSyncStatusStore } from './useSyncStatusStore';
import { newId } from '../utils/newId';

/**
 * Catálogo de actividades: tipos (categorías) y actividades disponibles
 * para construir "Mi día". Se guarda en Firestore por familia; la UI se
 * actualiza al instante (optimista) y el guardado ocurre en segundo plano.
 */

export type { CatalogCategory, CatalogItem };

interface CatalogState {
  categories: CatalogCategory[];
  items: CatalogItem[];
  loaded: boolean;
  load: (familyId: string) => Promise<void>;
  reset: () => void;
  addCategory: (label: string, color: { bg: string; stroke: string }) => CatalogCategory;
  addItem: (item: { iconKey: string; imageUri?: string; label: string; categoryId: string }) => CatalogItem;
  updateItem: (itemId: string, changes: Partial<Omit<CatalogItem, 'id'>>) => void;
  removeItem: (itemId: string) => void;
  getCategory: (categoryId: string) => CatalogCategory | undefined;
}

const familyId = () => useAuthStore.getState().family?.id;

function persist(label: string, work: (fid: string) => Promise<void>) {
  const fid = familyId();
  if (!fid) return;
  work(fid).catch(err => useSyncStatusStore.getState().report(`catalog.${label}`, err));
}

const initialCategories: CatalogCategory[] = [
  { id: 'rutinas', label: 'RUTINAS', bg: '#E8E0D0', stroke: '#2a2418' },
  { id: 'higiene', label: 'HIGIENE Y CUIDADO', bg: '#A8DC83', stroke: '#10210a' },
  { id: 'lugares', label: 'A DÓNDE VOY', bg: '#C9A8E2', stroke: '#1a0a2a' },
  { id: 'social', label: 'MOMENTO SOCIAL', bg: '#7FC4E8', stroke: '#0a1a2a' },
];

const initialItems: CatalogItem[] = [
  { id: 'i-despertar', iconKey: 'sol', label: 'despertar', categoryId: 'rutinas' },
  { id: 'i-siesta', iconKey: 'luna', label: 'siesta', categoryId: 'rutinas' },
  { id: 'i-dormir', iconKey: 'luna', label: 'dormir', categoryId: 'rutinas' },
  { id: 'i-esperar', iconKey: 'esperar', label: 'esperar', categoryId: 'rutinas' },

  { id: 'i-desayuno', iconKey: 'comer', label: 'desayuno', categoryId: 'higiene' },
  { id: 'i-comer', iconKey: 'comer', label: 'comer', categoryId: 'higiene' },
  { id: 'i-merienda', iconKey: 'beber', label: 'merienda', categoryId: 'higiene' },
  { id: 'i-lavarse', iconKey: 'lavar', label: 'lavarse', categoryId: 'higiene' },
  { id: 'i-banarse', iconKey: 'banar', label: 'bañarse', categoryId: 'higiene' },
  { id: 'i-cepillarse', iconKey: 'lavar', label: 'cepillarse', categoryId: 'higiene' },
  { id: 'i-vestirse', iconKey: 'persona', label: 'vestirse', categoryId: 'higiene' },
  { id: 'i-leer', iconKey: 'leer', label: 'leer', categoryId: 'higiene' },

  { id: 'i-casa', iconKey: 'casa', label: 'casa', categoryId: 'lugares' },
  { id: 'i-cole', iconKey: 'cole', label: 'cole', categoryId: 'lugares' },
  { id: 'i-parque', iconKey: 'parque', label: 'parque', categoryId: 'lugares' },
  { id: 'i-super', iconKey: 'casa', label: 'súper', categoryId: 'lugares' },
  { id: 'i-dentista', iconKey: 'dentista', label: 'dentista', categoryId: 'lugares' },
  { id: 'i-abuelos', iconKey: 'casa', label: 'abuelos', categoryId: 'lugares' },

  { id: 'i-jugar', iconKey: 'jugar', label: 'jugar', categoryId: 'social' },
  { id: 'i-visita', iconKey: 'persona', label: 'visita', categoryId: 'social' },
  { id: 'i-cumple', iconKey: 'corazon', label: 'cumple', categoryId: 'social' },
];

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: initialCategories,
  items: initialItems,
  loaded: false,

  load: async fid => {
    try {
      const data = await catalogUseCases.get.execute(fid, {
        categories: initialCategories.map((c, i) => ({ ...c, order: i })),
        items: initialItems,
      });
      set({ categories: data.categories, items: data.items, loaded: true });
    } catch (err) {
      useSyncStatusStore.getState().report('catalog.load', err);
      set({ loaded: true });
    }
  },

  reset: () => set({ categories: initialCategories, items: initialItems, loaded: false }),

  addCategory: (label, color) => {
    const category: CatalogCategory = {
      id: newId('cat-'),
      label: label.trim().toUpperCase(),
      ...color,
      order: get().categories.length,
    };
    set(state => ({ categories: [...state.categories, category] }));
    persist('addCategory', fid => catalogUseCases.saveCategory.execute(fid, category));
    return category;
  },

  addItem: item => {
    const newItem: CatalogItem = { id: newId('item-'), ...item };
    set(state => ({ items: [...state.items, newItem] }));
    persist('addItem', fid => catalogUseCases.saveItem.execute(fid, newItem));
    return newItem;
  },

  updateItem: (itemId, changes) => {
    set(state => ({
      items: state.items.map(it => (it.id === itemId ? { ...it, ...changes } : it)),
    }));
    persist('updateItem', () => catalogUseCases.updateItem.execute(itemId, changes));
  },

  removeItem: itemId => {
    set(state => ({ items: state.items.filter(it => it.id !== itemId) }));
    persist('removeItem', () => catalogUseCases.deleteItem.execute(itemId));
  },

  getCategory: categoryId => get().categories.find(c => c.id === categoryId),
}));
