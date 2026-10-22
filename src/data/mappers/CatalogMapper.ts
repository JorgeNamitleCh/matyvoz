import { CatalogCategory, CatalogItem } from '../../core/domain/entities';

/** Quita las llaves con `undefined` — Firestore no las acepta. */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export const CatalogMapper = {
  categoryFromFirestore(id: string, data: Record<string, any>): CatalogCategory {
    return { id, label: data.label, bg: data.bg, stroke: data.stroke, order: data.order ?? 0 };
  },

  categoryToFirestore(familyId: string, c: CatalogCategory): Record<string, unknown> {
    return stripUndefined({ familyId, label: c.label, bg: c.bg, stroke: c.stroke, order: c.order ?? 0 });
  },

  itemFromFirestore(id: string, data: Record<string, any>): CatalogItem {
    return {
      id,
      iconKey: data.iconKey,
      imageUri: data.imageUri ?? undefined,
      label: data.label,
      categoryId: data.categoryId,
    };
  },

  itemToFirestore(familyId: string, it: CatalogItem): Record<string, unknown> {
    return stripUndefined({
      familyId,
      iconKey: it.iconKey,
      imageUri: it.imageUri,
      label: it.label,
      categoryId: it.categoryId,
    });
  },
};
