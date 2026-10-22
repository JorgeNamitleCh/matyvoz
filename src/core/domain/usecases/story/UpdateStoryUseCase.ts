import { Story } from '../../entities';
import { IStoryRepository } from '../../repositories';

export class UpdateStoryUseCase {
  constructor(private readonly repo: IStoryRepository) {}

  execute(id: string, data: Partial<Omit<Story, 'id' | 'familyId'>>): Promise<void> {
    return this.repo.update(id, data);
  }
}
