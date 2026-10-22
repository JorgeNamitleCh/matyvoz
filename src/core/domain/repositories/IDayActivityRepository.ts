import { DayActivity } from '../entities';

export interface IDayActivityRepository {
  /** Actividades "solo hoy" de una fecha ("YYYY-MM-DD"). */
  getOnceByDate(familyId: string, dateKey: string): Promise<DayActivity[]>;
  /** Actividades que se repiten (diario, entre semana, fin de semana). */
  getRecurring(familyId: string): Promise<DayActivity[]>;
  /** Crea con el id dado. */
  save(activity: DayActivity): Promise<void>;
  update(id: string, changes: Partial<Omit<DayActivity, 'id' | 'familyId'>>): Promise<void>;
  delete(id: string): Promise<void>;
}
