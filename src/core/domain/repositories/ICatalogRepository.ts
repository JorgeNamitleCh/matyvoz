import { CatalogCategory, CatalogItem } from '../entities';

export interface ICatalogRepository {
  getCategories(familyId: string): Promise<CatalogCategory[]>;
  getItems(familyId: string): Promise<CatalogItem[]>;
  /** Crea o reemplaza una categoría con el id dado. */
  saveCategory(familyId: string, category: CatalogCategory): Promise<void>;
  /** Crea o reemplaza un ítem con el id dado. */
  saveItem(familyId: string, item: CatalogItem): Promise<void>;
  updateItem(id: string, changes: Partial<Omit<CatalogItem, 'id'>>): Promise<void>;
  deleteItem(id: string): Promise<void>;
  /** Guarda varias categorías e ítems de una sola vez (catálogo inicial). */
  saveMany(familyId: string, categories: CatalogCategory[], items: CatalogItem[]): Promise<void>;
}
