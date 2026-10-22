import { Child } from '../../core/domain/entities';

export const ChildMapper = {
  fromFirestore(id: string, data: Record<string, any>): Child {
    return {
      id,
      familyId: data.familyId,
      name: data.name,
      age: data.age,
      supportType: data.supportType,
      neurodivergence: data.neurodivergence ?? [],
      communicationType: data.communicationType,
      sensitivities: data.sensitivities ?? [],
      minimalAnimations: data.minimalAnimations ?? false,
    };
  },

  toFirestore(child: Omit<Child, 'id'>): Record<string, unknown> {
    return { ...child };
  },
};
