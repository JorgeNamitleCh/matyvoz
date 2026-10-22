import { Child } from '../entities';

export interface IChildRepository {
  getById(id: string): Promise<Child | null>;
  getByFamilyId(familyId: string): Promise<Child[]>;
  create(child: Omit<Child, 'id'>): Promise<Child>;
  update(id: string, data: Partial<Omit<Child, 'id'>>): Promise<Child>;
}
