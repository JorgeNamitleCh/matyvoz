import { FirebaseDataSource } from '../datasources/firebase/FirebaseDataSource';
import { ITimerRepository } from '../../core/domain/repositories';
import { TimerSession } from '../../core/domain/entities';

const COL = 'timerSessions';

export class FirebaseTimerRepository extends FirebaseDataSource implements ITimerRepository {
  async create(session: Omit<TimerSession, 'id'>): Promise<TimerSession> {
    const ref = await this.addDoc(COL, {
      childId: session.childId,
      durationMinutes: session.durationMinutes,
      startedAt: session.startedAt,
      linkedActivityId: session.linkedActivityId ?? null,
    });
    return { id: ref.id, ...session };
  }

  async getByChildId(childId: string): Promise<TimerSession[]> {
    const snap = await this.collection(COL).where('childId', '==', childId).orderBy('startedAt', 'desc').get();
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        childId: data.childId,
        durationMinutes: data.durationMinutes,
        startedAt: data.startedAt?.toDate?.() ?? new Date(),
        linkedActivityId: data.linkedActivityId ?? undefined,
      };
    });
  }
}
