import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDayStore } from '../stores/useDayStore';

/**
 * Mantiene "Mi día" sincronizado con la hora real: recalcula qué actividad
 * es "ahora" cada 30 s y al volver a la app.
 */
export function useDayClock() {
  useEffect(() => {
    const refresh = () => useDayStore.getState().refreshStates();
    const id = setInterval(refresh, 30000);
    const sub = AppState.addEventListener('change', st => {
      if (st === 'active') refresh();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);
}
