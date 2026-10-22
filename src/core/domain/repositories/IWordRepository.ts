import { Word } from '../entities';

export interface IWordRepository {
  getByFamilyId(familyId: string): Promise<Word[]>;
  /** Crea o reemplaza la palabra con su id. */
  save(word: Word): Promise<void>;
  saveMany(words: Word[]): Promise<void>;
  delete(id: string): Promise<void>;
}
