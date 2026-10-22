import { Story } from '../../entities';
import { IStoryRepository } from '../../repositories';

export class SaveStoryUseCase {
  constructor(private readonly repo: IStoryRepository) {}

  execute(story: Story): Promise<void> {
    return this.repo.save({ ...story, updatedAt: new Date() });
  }
}
