import { Activity } from '../../entities';
import { IActivityRepository } from '../../repositories';

export class AddActivityUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(data: Omit<Activity, 'id'>): Promise<Activity> {
    return this.activityRepository.create(data);
  }
}
