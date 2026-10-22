import { Activity } from '../entities';

export interface IActivityRepository {
  getByChildAndDate(childId: string, date: Date): Promise<Activity[]>;
  getRecurring(childId: string): Promise<Activity[]>;
  create(activity: Omit<Activity, 'id'>): Promise<Activity>;
  update(id: string, data: Partial<Activity>): Promise<Activity>;
  delete(id: string): Promise<void>;
}
