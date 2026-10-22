import { DayActivity } from '../../entities';
import { IDayActivityRepository } from '../../repositories';

export class AddDayActivityUseCase {
  constructor(private readonly repo: IDayActivityRepository) {}

  execute(activity: DayActivity): Promise<void> {
    return this.repo.save(activity);
  }
}
