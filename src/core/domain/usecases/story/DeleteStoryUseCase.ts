import { IStoryRepository } from '../../repositories';

export class DeleteStoryUseCase {
  constructor(private readonly repo: IStoryRepository) {}

  execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
