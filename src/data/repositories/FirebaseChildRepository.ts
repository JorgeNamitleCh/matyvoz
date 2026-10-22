import { FirebaseDataSource } from '../datasources/firebase/FirebaseDataSource';
import { IChildRepository } from '../../core/domain/repositories';
import { Child } from '../../core/domain/entities';
import { ChildMapper } from '../mappers/ChildMapper';

const COL = 'children';

export class FirebaseChildRepository extends FirebaseDataSource implements IChildRepository {
  async getById(id: string): Promise<Child | null> {
    const doc = await this.getDoc(COL, id);
    if (!doc.exists) return null;
    return ChildMapper.fromFirestore(doc.id, doc.data() as Record<string, any>);
  }

  async getByFamilyId(familyId: string): Promise<Child[]> {
    const snap = await this.collection(COL).where('familyId', '==', familyId).get();
    return snap.docs.map(d => ChildMapper.fromFirestore(d.id, d.data()));
  }

  async create(child: Omit<Child, 'id'>): Promise<Child> {
    const ref = await this.addDoc(COL, ChildMapper.toFirestore(child));
    return { id: ref.id, ...child };
  }

  async update(id: string, data: Partial<Child>): Promise<Child> {
    await this.updateDoc(COL, id, data as Record<string, unknown>);
    const updated = await this.getById(id);
    return updated!;
  }
}
