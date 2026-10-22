import { create } from 'zustand';
import { Child } from '../../core/domain/entities';
import { childUseCases } from '../../infrastructure/di/container';

interface ChildState {
  currentChild: Child | null;
  loading: boolean;
  setCurrentChild: (child: Child | null) => void;
  updateChild: (data: Partial<Child>) => void;
  /** Trae de Firestore el perfil de la familia con sesión iniciada. */
  load: (familyId: string) => Promise<void>;
  /** Crea o actualiza el perfil (según tenga id) y lo deja como actual. */
  save: (child: Omit<Child, 'id'> & { id?: string }) => Promise<Child>;
  reset: () => void;
}

export const useChildStore = create<ChildState>(set => ({
  currentChild: null,
  loading: false,
  setCurrentChild: child => set({ currentChild: child }),
  updateChild: data =>
    set(state =>
      state.currentChild
        ? { currentChild: { ...state.currentChild, ...data } }
        : state,
    ),
  load: async familyId => {
    set({ loading: true });
    try {
      const child = await childUseCases.getForFamily.execute(familyId);
      set({ currentChild: child });
    } catch (e) {
      console.warn('[useChildStore] no se pudo cargar el perfil', e);
    } finally {
      set({ loading: false });
    }
  },
  save: async child => {
    const saved = await childUseCases.save.execute(child);
    set({ currentChild: saved });
    return saved;
  },
  reset: () => set({ currentChild: null, loading: false }),
}));
