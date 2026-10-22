import { FirebaseDataSource } from '../datasources/firebase/FirebaseDataSource';
import { IWordRepository } from '../../core/domain/repositories';
import { Word } from '../../core/domain/entities';
import { WordMapper } from '../mappers/WordMapper';

const COL = 'words';

export class FirebaseWordRepository extends FirebaseDataSource implements IWordRepository {
  async getByFamilyId(familyId: string): Promise<Word[]> {
    const snap = await this.collection(COL).where('familyId', '==', familyId).get();
    return snap.docs.map(d => WordMapper.fromFirestore(d.id, d.data()));
  }

  save(word: Word): Promise<void> {
    return this.setDoc(COL, word.id, WordMapper.toFirestore(word));
  }

  async saveMany(words: Word[]): Promise<void> {
    const batch = this.db.batch();
    words.forEach(w => batch.set(this.collection(COL).doc(w.id), WordMapper.toFirestore(w)));
    await batch.commit();
  }

  delete(id: string): Promise<void> {
    return this.deleteDoc(COL, id);
  }
}
