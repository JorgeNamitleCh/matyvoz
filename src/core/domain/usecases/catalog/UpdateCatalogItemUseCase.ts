import { CatalogItem } from '../../entities';
import { ICatalogRepository } from '../../repositories';

export class UpdateCatalogItemUseCase {
  constructor(private readonly repo: ICatalogRepository) {}

  execute(id: string, changes: Partial<Omit<CatalogItem, 'id'>>): Promise<void> {
    return this.repo.updateItem(id, changes);
  }
}
