import { Activity } from '../../core/domain/entities';

export const ActivityMapper = {
  fromFirestore(id: string, data: Record<string, any>): Activity {
    return {
      id,
      childId: data.childId,
      name: data.name,
      iconKey: data.iconKey,
      category: data.category,
      hour: data.hour,
      time: data.time?.toDate?.() ?? new Date(),
      recurrence: data.recurrence,
      linkedStoryId: data.linkedStoryId,
      color: data.color,
      isCompleted: data.isCompleted ?? false,
    };
  },

  toFirestore(activity: Omit<Activity, 'id'>): Record<string, unknown> {
    return { ...activity };
  },
};
