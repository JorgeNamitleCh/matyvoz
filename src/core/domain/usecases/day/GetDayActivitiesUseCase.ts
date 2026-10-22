import { DayActivity, toDateKey } from '../../entities';
import { IDayActivityRepository } from '../../repositories';

/** Junta las actividades "solo hoy" de la fecha + las recurrentes que tocan ese día. */
export class GetDayActivitiesUseCase {
  constructor(private readonly repo: IDayActivityRepository) {}

  async execute(familyId: string, date: Date): Promise<DayActivity[]> {
    const dateKey = toDateKey(date);
    const [once, recurring] = await Promise.all([
      this.repo.getOnceByDate(familyId, dateKey),
      this.repo.getRecurring(familyId),
    ]);

    const day = date.getDay();
    const todays = recurring.filter(a => {
      if (a.recurrence === 'daily') return true;
      if (a.recurrence === 'weekdays') return day >= 1 && day <= 5;
      if (a.recurrence === 'weekends') return day === 0 || day === 6;
      return false;
    });

    return [...once, ...todays].sort((a, b) => a.time.localeCompare(b.time));
  }
}
