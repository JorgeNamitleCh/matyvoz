import { ActivityRecurrence } from './Activity';

/** Actividad colocada en la línea de tiempo de "Mi día". */
export interface DayActivity {
  id: string;
  familyId: string;
  catalogItemId?: string;
  label: string;
  iconKey: string;
  /** Foto propia (data URI comprimida) */
  imageUri?: string;
  color: { bg: string; stroke: string };
  /** Texto del badge de categoría, ej. "RUTINAS" */
  categoryLabel: string;
  /** Hora "HH:MM" en 24 h */
  time: string;
  recurrence: ActivityRecurrence;
  /** "YYYY-MM-DD" — solo para recurrence === 'once' */
  date?: string;
  /** Días ("YYYY-MM-DD") en que se marcó como hecha */
  doneDates: string[];
}

/** Fecha local en formato "YYYY-MM-DD". */
export function toDateKey(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
