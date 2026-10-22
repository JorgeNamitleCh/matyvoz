import firestore from '@react-native-firebase/firestore';
import { FirebaseDataSource } from '../datasources/firebase/FirebaseDataSource';
import { IDayActivityRepository } from '../../core/domain/repositories';
import { DayActivity } from '../../core/domain/entities';
import { DayActivityMapper } from '../mappers/DayActivityMapper';

const COL = 'dayActivities';

export class FirebaseDayActivityRepository extends FirebaseDataSource implements IDayActivityRepository {
  async getOnceByDate(familyId: string, dateKey: string): Promise<DayActivity[]> {
    const snap = await this.collection(COL)
      .where('familyId', '==', familyId)
      .where('date', '==', dateKey)
      .get();
    return snap.docs
      .map(d => DayActivityMapper.fromFirestore(d.id, d.data()))
      .filter(a => a.recurrence === 'once');
  }

  async getRecurring(familyId: string): Promise<DayActivity[]> {
    const snap = await this.collection(COL)
      .where('familyId', '==', familyId)
      .where('recurrence', 'in', ['daily', 'weekdays', 'weekends'])
      .get();
    return snap.docs.map(d => DayActivityMapper.fromFirestore(d.id, d.data()));
  }

  save(activity: DayActivity): Promise<void> {
    return this.setDoc(COL, activity.id, DayActivityMapper.toFirestore(activity));
  }

  update(id: string, changes: Partial<Omit<DayActivity, 'id' | 'familyId'>>): Promise<void> {
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(changes)) {
      data[k] = v === undefined ? firestore.FieldValue.delete() : v;
    }
    return this.updateDoc(COL, id, data);
  }

  delete(id: string): Promise<void> {
    return this.deleteDoc(COL, id);
  }
}
