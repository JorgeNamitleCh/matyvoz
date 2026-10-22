import firestore from '@react-native-firebase/firestore';
import { FirebaseDataSource } from '../datasources/firebase/FirebaseDataSource';
import { IStoryRepository } from '../../core/domain/repositories';
import { Story } from '../../core/domain/entities';
import { StoryMapper } from '../mappers/StoryMapper';

const COL = 'stories';

export class FirebaseStoryRepository extends FirebaseDataSource implements IStoryRepository {
  async getByFamily(familyId: string): Promise<Story[]> {
    const snap = await this.collection(COL).where('familyId', '==', familyId).get();
    return snap.docs.map(d => StoryMapper.fromFirestore(d.id, d.data()));
  }

  save(story: Story): Promise<void> {
    return this.setDoc(COL, story.id, StoryMapper.toFirestore(story));
  }

  update(id: string, data: Partial<Omit<Story, 'id' | 'familyId'>>): Promise<void> {
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(data)) {
      patch[k] = v === undefined ? firestore.FieldValue.delete() : v;
    }
    return this.updateDoc(COL, id, patch);
  }

  delete(id: string): Promise<void> {
    return this.deleteDoc(COL, id);
  }
}
