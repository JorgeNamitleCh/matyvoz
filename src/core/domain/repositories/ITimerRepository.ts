import { TimerSession } from '../entities';

export interface ITimerRepository {
  create(session: Omit<TimerSession, 'id'>): Promise<TimerSession>;
  getByChildId(childId: string): Promise<TimerSession[]>;
}
