import { CatalogCategory, CatalogItem } from '../../entities';
import { ICatalogRepository } from '../../repositories';

/**
 * Carga el catálogo de la familia. Si todavía no tiene nada (primera vez),
 * guarda el catálogo inicial y lo devuelve.
 */
export class GetCatalogUseCase {
  constructor(private readonly repo: ICatalogRepository) {}

  async execute(
    familyId: string,
    defaults: { categories: CatalogCategory[]; items: CatalogItem[] },
  ): Promise<{ categories: CatalogCategory[]; items: CatalogItem[] }> {
    const [categories, items] = await Promise.all([
      this.repo.getCategories(familyId),
      this.repo.getItems(familyId),
    ]);

    if (categories.length === 0 && items.length === 0) {
      // Los ids del catálogo inicial son genéricos ("rutinas", "i-cole"...):
      // se prefijan con la familia para no chocar con los de otras familias.
      const ns = (id: string) => `${familyId}_${id}`;
      const seeded = {
        categories: defaults.categories.map(c => ({ ...c, id: ns(c.id) })),
        items: defaults.items.map(it => ({ ...it, id: ns(it.id), categoryId: ns(it.categoryId) })),
      };
      await this.repo.saveMany(familyId, seeded.categories, seeded.items);
      return seeded;
    }

    const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return { categories: sorted, items };
  }
}
