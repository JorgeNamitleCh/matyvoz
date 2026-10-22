import { DayActivity } from '../../core/domain/entities';
import { stripUndefined } from './CatalogMapper';

export const DayActivityMapper = {
  fromFirestore(id: string, data: Record<string, any>): DayActivity {
    return {
      id,
      familyId: data.familyId,
      catalogItemId: data.catalogItemId ?? undefined,
      label: data.label,
      iconKey: data.iconKey,
      imageUri: data.imageUri ?? undefined,
      color: data.color ?? { bg: '#E8E0D0', stroke: '#2a2418' },
      categoryLabel: data.categoryLabel ?? '',
      time: data.time,
      recurrence: data.recurrence,
      date: data.date ?? undefined,
      doneDates: Array.isArray(data.doneDates) ? data.doneDates : [],
    };
  },

  toFirestore(a: DayActivity): Record<string, unknown> {
    const data: Record<string, unknown> = { ...a };
    delete data.id;
    return stripUndefined(data);
  },
};
