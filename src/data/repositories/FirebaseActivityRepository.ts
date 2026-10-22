import firestore from '@react-native-firebase/firestore';
import { FirebaseDataSource } from '../datasources/firebase/FirebaseDataSource';
import { IActivityRepository } from '../../core/domain/repositories';
import { Activity } from '../../core/domain/entities';
import { ActivityMapper } from '../mappers/ActivityMapper';

const COL = 'activities';

export class FirebaseActivityRepository extends FirebaseDataSource implements IActivityRepository {
  async getByChildAndDate(childId: string, date: Date): Promise<Activity[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const snap = await this.collection(COL)
      .where('childId', '==', childId)
      .where('recurrence', '==', 'once')
      .where('time', '>=', firestore.Timestamp.fromDate(start))
      .where('time', '<=', firestore.Timestamp.fromDate(end))
      .get();

    return snap.docs.map(d => ActivityMapper.fromFirestore(d.id, d.data()));
  }

  async getRecurring(childId: string): Promise<Activity[]> {
    const snap = await this.collection(COL)
      .where('childId', '==', childId)
      .where('recurrence', 'in', ['daily', 'weekdays', 'weekends'])
      .get();
    return snap.docs.map(d => ActivityMapper.fromFirestore(d.id, d.data()));
  }

  async create(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const ref = await this.addDoc(COL, ActivityMapper.toFirestore(activity));
    return { id: ref.id, ...activity };
  }

  async update(id: string, data: Partial<Activity>): Promise<Activity> {
    await this.updateDoc(COL, id, data as Record<string, unknown>);
    const doc = await this.getDoc(COL, id);
    return ActivityMapper.fromFirestore(doc.id, doc.data() as Record<string, any>);
  }

  async delete(id: string): Promise<void> {
    await this.deleteDoc(COL, id);
  }
}
