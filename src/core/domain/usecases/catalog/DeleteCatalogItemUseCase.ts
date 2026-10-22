import { ICatalogRepository } from '../../repositories';

export class DeleteCatalogItemUseCase {
  constructor(private readonly repo: ICatalogRepository) {}

  execute(id: string): Promise<void> {
    return this.repo.deleteItem(id);
  }
}
