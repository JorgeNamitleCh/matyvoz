import { Vibration } from 'react-native';
import { create } from 'zustand';

/**
 * Temporizador visual. Corre de forma independiente a las pantallas
 * (sigue contando aunque se navegue a otra).
 */
interface TimerState {
  isRunning: boolean;
  secondsLeft: number;
  totalSeconds: number;
  /** Actividad de Mi día que sigue cuando termine (opcional). */
  nextDayItemId: string | null;
  finishedAt: number | null;
  intervalRef: ReturnType<typeof setInterval> | null;
  /** Fija la duración sin arrancar (reinicia el conteo). */
  setDuration: (seconds: number) => void;
  start: (seconds?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  /** Termina ya (botón ⏭). */
  finish: () => void;
  setNextDayItem: (id: string | null) => void;
  tick: () => void;
}

const DEFAULT_SECONDS = 10 * 60;

export const useTimerStore = create<TimerState>((set, get) => {
  const clear = () => {
    const ref = get().intervalRef;
    if (ref) clearInterval(ref);
  };
  const run = () => {
    clear();
    const ref = setInterval(() => get().tick(), 1000);
    set({ intervalRef: ref, isRunning: true, finishedAt: null });
  };

  return {
    isRunning: false,
    secondsLeft: DEFAULT_SECONDS,
    totalSeconds: DEFAULT_SECONDS,
    nextDayItemId: null,
    finishedAt: null,
    intervalRef: null,

    setDuration: seconds => {
      clear();
      set({ secondsLeft: seconds, totalSeconds: seconds, isRunning: false, intervalRef: null, finishedAt: null });
    },

    start: seconds => {
      const total = seconds ?? get().totalSeconds;
      set({ secondsLeft: total, totalSeconds: total });
      run();
    },

    pause: () => {
      clear();
      set({ isRunning: false, intervalRef: null });
    },

    resume: () => {
      if (get().secondsLeft <= 0) return;
      run();
    },

    reset: () => {
      clear();
      set({ isRunning: false, secondsLeft: get().totalSeconds, intervalRef: null, finishedAt: null });
    },

    finish: () => {
      clear();
      set({ isRunning: false, secondsLeft: 0, intervalRef: null, finishedAt: Date.now() });
      Vibration.vibrate([0, 400, 200, 400]);
    },

    setNextDayItem: id => set({ nextDayItemId: id }),

    tick: () => {
      const { secondsLeft } = get();
      if (secondsLeft <= 1) {
        get().finish();
      } else {
        set({ secondsLeft: secondsLeft - 1 });
      }
    },
  };
});
