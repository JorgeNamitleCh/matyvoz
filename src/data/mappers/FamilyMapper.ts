import { Family } from '../../core/domain/entities';

export const FamilyMapper = {
  fromFirestore(id: string, data: Record<string, any>): Family {
    return {
      id,
      name: data.name,
      email: data.email,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  },

  toFirestore(family: Omit<Family, 'id'>): Record<string, unknown> {
    return {
      name: family.name,
      email: family.email,
      role: family.role ?? null,
      createdAt: family.createdAt,
    };
  },
};
