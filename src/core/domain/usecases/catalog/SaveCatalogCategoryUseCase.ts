import { CatalogCategory } from '../../entities';
import { ICatalogRepository } from '../../repositories';

export class SaveCatalogCategoryUseCase {
  constructor(private readonly repo: ICatalogRepository) {}

  execute(familyId: string, category: CatalogCategory): Promise<void> {
    return this.repo.saveCategory(familyId, category);
  }
}
