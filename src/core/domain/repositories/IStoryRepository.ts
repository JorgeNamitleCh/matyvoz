import { Story } from '../entities';

export interface IStoryRepository {
  getByFamily(familyId: string): Promise<Story[]>;
  /** Crea o reemplaza la historia con su id. */
  save(story: Story): Promise<void>;
  update(id: string, data: Partial<Omit<Story, 'id' | 'familyId'>>): Promise<void>;
  delete(id: string): Promise<void>;
}
