export type ActivityCategory = 'routines' | 'hygiene' | 'places' | 'social' | 'food';
export type ActivityRecurrence = 'once' | 'daily' | 'weekdays' | 'weekends';

export interface Activity {
  id: string;
  childId: string;
  name: string;
  iconKey: string;
  category: ActivityCategory;
  hour: string;
  time: Date;
  recurrence: ActivityRecurrence;
  linkedStoryId?: string;
  color: string;
  isCompleted?: boolean;
}
