import { Activity } from '../../entities';
import { IActivityRepository } from '../../repositories';

export class GetActivitiesForDateUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(childId: string, date: Date): Promise<Activity[]> {
    const [dated, recurring] = await Promise.all([
      this.activityRepository.getByChildAndDate(childId, date),
      this.activityRepository.getRecurring(childId),
    ]);

    const dayOfWeek = date.getDay();
    const filteredRecurring = recurring.filter(a => {
      if (a.recurrence === 'daily') return true;
      if (a.recurrence === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (a.recurrence === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      return false;
    });

    const allActivities = [...filteredRecurring, ...dated];
    return allActivities.sort((a, b) => a.hour.localeCompare(b.hour));
  }
}
