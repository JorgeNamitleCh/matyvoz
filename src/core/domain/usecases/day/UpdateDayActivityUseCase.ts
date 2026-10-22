import { DayActivity } from '../../entities';
import { IDayActivityRepository } from '../../repositories';

export class UpdateDayActivityUseCase {
  constructor(private readonly repo: IDayActivityRepository) {}

  execute(id: string, changes: Partial<Omit<DayActivity, 'id' | 'familyId'>>): Promise<void> {
    return this.repo.update(id, changes);
  }
}
