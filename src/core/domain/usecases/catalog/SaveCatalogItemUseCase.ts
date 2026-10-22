import { CatalogItem } from '../../entities';
import { ICatalogRepository } from '../../repositories';

export class SaveCatalogItemUseCase {
  constructor(private readonly repo: ICatalogRepository) {}

  execute(familyId: string, item: CatalogItem): Promise<void> {
    return this.repo.saveItem(familyId, item);
  }
}
