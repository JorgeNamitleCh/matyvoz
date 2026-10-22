import { create } from 'zustand';

/**
 * Errores de sincronización con Firestore. Los stores reportan aquí cuando
 * un guardado/carga falla, y `useSyncErrorDialog` se lo muestra al usuario
 * (en vez de fallar en silencio).
 */
interface SyncStatusState {
  error: { where: string; code?: string; message: string } | null;
  report: (where: string, err: unknown) => void;
  clear: () => void;
}

export const useSyncStatusStore = create<SyncStatusState>(set => ({
  error: null,
  report: (where, err) => {
    const e = err as { code?: string; message?: string };
    console.warn(`[sync] ${where} falló`, err);
    set({ error: { where, code: e?.code, message: e?.message ?? String(err) } });
  },
  clear: () => set({ error: null }),
}));
