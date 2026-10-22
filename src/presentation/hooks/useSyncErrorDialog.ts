import { useEffect } from 'react';
import { useSyncStatusStore } from '../stores/useSyncStatusStore';
import { useVoiceNoticeStore } from '../stores/useVoiceNoticeStore';
import { useDialog } from '../providers/DialogProvider';

/** Muestra un diálogo cuando algo no se pudo guardar/cargar en la nube. */
export function useSyncErrorDialog() {
  const error = useSyncStatusStore(state => state.error);
  const clear = useSyncStatusStore(state => state.clear);
  const { showDialog } = useDialog();

  useEffect(() => {
    if (!error) return;
    const denied = error.code?.includes('permission-denied');
    showDialog({
      title: 'No se pudo guardar',
      message: denied
        ? `Firestore rechazó la operación por permisos (${error.where}). Revisa las reglas de seguridad para esta colección.`
        : `Algo falló al sincronizar (${error.where}).\n${error.code ?? ''} ${error.message}`.trim(),
    });
    clear();
  }, [error, clear, showDialog]);
}

/** Avisa (una vez) si la voz no está instalada en esta compilación de la app. */
export function useVoiceNoticeDialog() {
  const pending = useVoiceNoticeStore(state => state.pending);
  const markShown = useVoiceNoticeStore(state => state.markShown);
  const { showDialog } = useDialog();

  useEffect(() => {
    if (!pending) return;
    markShown();
    showDialog({
      title: 'La voz no está instalada',
      message:
        'Esta versión de la app se compiló sin el módulo de voz. En la Mac corre:\n\nyarn\ncd ios && bundle exec pod install\nyarn ios\n\nLuego se oirán las palabras y frases.',
    });
  }, [pending, markShown, showDialog]);
}
