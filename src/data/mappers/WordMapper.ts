import { Word } from '../../core/domain/entities';
import { stripUndefined } from './CatalogMapper';

const LEGACY_ICON: Record<string, string> = { person: 'persona', action: 'jugar', place: 'casa', emotion: 'feliz', object: 'regalo', food: 'comer' };

export const WordMapper = {
  fromFirestore(id: string, data: Record<string, any>): Word {
    const category = data.category ?? 'object';
    return {
      id,
      familyId: data.familyId,
      label: data.label ?? '',
      category,
      iconKey: data.iconKey ?? LEGACY_ICON[category] ?? 'estrella',
      photoUrl: data.photoUrl ?? undefined,
      audioUrl: data.audioUrl ?? undefined,
      subtitle: data.subtitle ?? undefined,
      syllables: data.syllables ?? '',
      variants: Array.isArray(data.variants) ? data.variants : [],
      description: data.description ?? '',
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  },

  toFirestore(word: Word): Record<string, unknown> {
    const data: Record<string, unknown> = { ...word };
    delete data.id;
    return stripUndefined(data);
  },
};
