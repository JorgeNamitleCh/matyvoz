export interface TimerSession {
  id: string;
  childId: string;
  durationMinutes: number;
  startedAt: Date;
  linkedActivityId?: string;
}
