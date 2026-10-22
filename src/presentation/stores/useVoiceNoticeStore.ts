import { create } from 'zustand';

/** Aviso (una vez por sesión) cuando la voz no está disponible en la app. */
interface VoiceNoticeState {
  pending: boolean;
  shown: boolean;
  notify: () => void;
  markShown: () => void;
}

export const useVoiceNoticeStore = create<VoiceNoticeState>((set, get) => ({
  pending: false,
  shown: false,
  notify: () => {
    if (!get().shown) set({ pending: true });
  },
  markShown: () => set({ pending: false, shown: true }),
}));
