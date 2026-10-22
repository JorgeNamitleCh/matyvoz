import { Story } from '../../entities';
import { IStoryRepository } from '../../repositories';

/** Historias de la familia: fijadas primero, luego las más recientes. */
export class GetStoriesUseCase {
  constructor(private readonly repo: IStoryRepository) {}

  async execute(familyId: string): Promise<Story[]> {
    const list = await this.repo.getByFamily(familyId);
    return list.sort((a, b) =>
      a.isPinned === b.isPinned ? b.updatedAt.getTime() - a.updatedAt.getTime() : a.isPinned ? -1 : 1,
    );
  }
}
