import { create } from 'zustand';
import { Child } from '../../core/domain/entities';

interface ChildState {
  currentChild: Child | null;
  setCurrentChild: (child: Child | null) => void;
  updateChild: (data: Partial<Child>) => void;
}

export const useChildStore = create<ChildState>(set => ({
  currentChild: null,
  setCurrentChild: child => set({ currentChild: child }),
  updateChild: data =>
    set(state =>
      state.currentChild
        ? { currentChild: { ...state.currentChild, ...data } }
        : state,
    ),
}));
