import { create } from 'zustand';
import { ActivityRecurrence, DayActivity, toDateKey } from '../../core/domain/entities';
import { dayUseCases } from '../../infrastructure/di/container';
import { useAuthStore } from './useAuthStore';
import { useSyncStatusStore } from './useSyncStatusStore';
import { newId } from '../utils/newId';

/**
 * Línea de tiempo de "Mi día", guardada en Firestore (colección
 * `dayActivities`). La UI se actualiza al instante y el guardado ocurre en
 * segundo plano.
 */

export type DayItemState = 'done' | 'now' | 'pending';

export interface DayItem extends DayActivity {
  state: DayItemState;
  sub?: string;
}

export interface NewDayItem {
  catalogItemId?: string;
  time: string;
  label: string;
  iconKey: string;
  imageUri?: string;
  color: { bg: string; stroke: string };
  categoryLabel: string;
  recurrence: ActivityRecurrence;
}

const byTime = (a: DayActivity, b: DayActivity) => a.time.localeCompare(b.time);

/** Misma actividad (mismo ítem del catálogo o mismo nombre) a la misma hora. */
function isDuplicate(
  list: DayActivity[],
  data: { time: string; label: string; catalogItemId?: string },
  ignoreId?: string,
): boolean {
  const sameLabel = data.label.trim().toLowerCase();
  return list.some(
    a =>
      a.id !== ignoreId &&
      a.time === data.time &&
      ((!!data.catalogItemId && a.catalogItemId === data.catalogItemId) ||
        a.label.trim().toLowerCase() === sameLabel),
  );
}
const todayKey = () => toDateKey(new Date());

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Estado de cada actividad según el reloj:
 * - "ahora": la última cuya hora ya llegó (y no se ha marcado hecha).
 * - Las anteriores a "ahora" ya pasaron: hechas.
 * - Las que no han llegado: pendientes (o hechas si se marcaron antes).
 */
function withStates(list: DayActivity[], at: Date = new Date()): DayItem[] {
  const key = toDateKey(at);
  const clock = at.getHours() * 60 + at.getMinutes();
  let current = -1;
  list.forEach((a, i) => {
    if (minutesOf(a.time) <= clock) current = i;
  });
  return list.map((a, i) => {
    const marked = a.doneDates.includes(key);
    let state: DayItemState;
    if (i < current) state = 'done';
    else if (i === current) state = marked ? 'done' : 'now';
    else state = marked ? 'done' : 'pending';
    return { ...a, state };
  });
}

const strip = ({ state: _s, sub: _sub, ...a }: DayItem): DayActivity => a;

function persist(label: string, work: () => Promise<void>) {
  if (!useAuthStore.getState().family) return;
  work().catch(err => useSyncStatusStore.getState().report(`day.${label}`, err));
}

export type DayViewMode = 'list' | 'cards';

interface DayState {
  items: DayItem[];
  /** Vista de Mi día: línea de tiempo (lista) o tarjetas grandes. */
  viewMode: DayViewMode;
  setViewMode: (mode: DayViewMode) => void;
  loading: boolean;
  load: (familyId: string, date?: Date) => Promise<void>;
  /** Recalcula ahora / hechas / pendientes con la hora actual. */
  refreshStates: () => void;
  reset: () => void;
  /**
   * Añade una actividad. Devuelve `false` (y no hace nada) si ya existe la
   * misma actividad a la misma hora — evita duplicados por doble toque.
   */
  addItem: (item: NewDayItem) => boolean;
  /**
   * Edita una actividad de Mi día (nombre, dibujo/foto, hora, frecuencia).
   * Devuelve `false` si el cambio la duplicaría con otra a la misma hora.
   */
  updateItem: (
    id: string,
    changes: Partial<Pick<DayActivity, 'label' | 'iconKey' | 'imageUri' | 'time' | 'recurrence'>>,
  ) => boolean;
  removeItem: (id: string) => void;
  /**
   * Mueve una actividad una posición arriba (-1) o abajo (+1).
   * Intercambia también las horas para que la línea de tiempo siga
   * siendo cronológica.
   */
  moveItem: (id: string, direction: -1 | 1) => void;
  markDone: (id: string) => void;
  /** Cambia la hora de una actividad y la recoloca en la línea de tiempo. */
  setItemTime: (id: string, time: string) => void;
}

export const useDayStore = create<DayState>((set, get) => {
  const commit = (list: DayActivity[]) => set({ items: withStates([...list].sort(byTime)) });
  const current = () => get().items.map(strip);

  return {
    items: [],
    loading: false,
    viewMode: 'list',
    setViewMode: viewMode => set({ viewMode }),

    load: async (familyId, date = new Date()) => {
      set({ loading: true });
      try {
        const list = await dayUseCases.get.execute(familyId, date);
        set({ items: withStates(list), loading: false });
      } catch (err) {
        useSyncStatusStore.getState().report('day.load', err);
        set({ loading: false });
      }
    },

    reset: () => set({ items: [], loading: false }),

    refreshStates: () => set({ items: withStates(current()) }),

    addItem: data => {
      if (isDuplicate(current(), data)) return false;

      const familyId = useAuthStore.getState().family?.id ?? '';
      const activity: DayActivity = {
        ...data,
        id: newId('day-'),
        familyId,
        date: data.recurrence === 'once' ? todayKey() : undefined,
        doneDates: [],
      };
      commit([...current(), activity]);
      persist('add', () => dayUseCases.add.execute(activity));
      return true;
    },

    updateItem: (id, changes) => {
      const list = current();
      const original = list.find(a => a.id === id);
      if (!original) return false;
      const merged = { ...original, ...changes };
      if (isDuplicate(list, merged, id)) return false;

      // "Solo hoy" guarda la fecha; las recurrentes no la llevan.
      const patch: Partial<DayActivity> = { ...changes };
      if (changes.recurrence && changes.recurrence !== original.recurrence) {
        patch.date = changes.recurrence === 'once' ? todayKey() : undefined;
      }
      if ('imageUri' in changes && !changes.imageUri) patch.imageUri = undefined;

      commit(list.map(a => (a.id === id ? { ...a, ...patch } : a)));
      persist('update', () => dayUseCases.update.execute(id, patch));
      return true;
    },

    removeItem: id => {
      commit(current().filter(a => a.id !== id));
      persist('remove', () => dayUseCases.delete.execute(id));
    },

    moveItem: (id, direction) => {
      const list = current();
      const i = list.findIndex(a => a.id === id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= list.length) return;
      const a = list[i];
      const b = list[j];
      const next = [...list];
      next[i] = { ...b, time: a.time };
      next[j] = { ...a, time: b.time };
      set({ items: withStates(next) });
      persist('move', async () => {
        await Promise.all([
          dayUseCases.update.execute(a.id, { time: b.time }),
          dayUseCases.update.execute(b.id, { time: a.time }),
        ]);
      });
    },

    markDone: id => {
      const key = todayKey();
      let doneDates: string[] = [];
      commit(
        current().map(a => {
          if (a.id !== id) return a;
          doneDates = a.doneDates.includes(key) ? a.doneDates : [...a.doneDates, key];
          return { ...a, doneDates };
        }),
      );
      persist('markDone', () => dayUseCases.update.execute(id, { doneDates }));
    },

    setItemTime: (id, time) => {
      commit(current().map(a => (a.id === id ? { ...a, time } : a)));
      persist('setTime', () => dayUseCases.update.execute(id, { time }));
    },
  };
});
