import { create } from 'zustand';
import { Family } from '../../core/domain/entities';

interface AuthState {
  family: Family | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setFamily: (family: Family | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  family: null,
  isAuthenticated: false,
  isLoading: true,
  setFamily: family =>
    set({ family, isAuthenticated: family !== null, isLoading: false }),
  setLoading: isLoading => set({ isLoading }),
  signOut: () => set({ family: null, isAuthenticated: false }),
}));
