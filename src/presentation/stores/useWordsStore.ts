import { create } from 'zustand';
import { Word, WordCategory } from '../../core/domain/entities';
import { wordUseCases } from '../../infrastructure/di/container';
import { useAuthStore } from './useAuthStore';
import { useSyncStatusStore } from './useSyncStatusStore';
import { newId } from '../utils/newId';

/** Glosario de palabras de la familia, guardado en Firestore (`words`). */
interface WordsState {
  words: Word[];
  loaded: boolean;
  searchTerm: string;
  load: (familyId: string) => Promise<void>;
  reset: () => void;
  setSearchTerm: (term: string) => void;
  newWord: (category?: WordCategory) => Word;
  saveWord: (word: Word) => void;
  removeWord: (id: string) => void;
  filteredWords: () => Word[];
}

function persist(label: string, work: () => Promise<void>) {
  if (!useAuthStore.getState().family) return;
  work().catch(err => useSyncStatusStore.getState().report(`words.${label}`, err));
}

const byLabel = (a: Word, b: Word) => a.label.localeCompare(b.label, 'es');

export const useWordsStore = create<WordsState>((set, get) => ({
  words: [],
  loaded: false,
  searchTerm: '',

  load: async familyId => {
    try {
      const words = await wordUseCases.get.execute(familyId);
      set({ words, loaded: true });
    } catch (err) {
      useSyncStatusStore.getState().report('words.load', err);
      set({ loaded: true });
    }
  },

  reset: () => set({ words: [], loaded: false, searchTerm: '' }),

  setSearchTerm: searchTerm => set({ searchTerm }),

  newWord: (category = 'person') => ({
    id: newId('word-'),
    familyId: useAuthStore.getState().family?.id ?? '',
    label: '',
    category,
    iconKey: 'estrella',
    syllables: '',
    variants: [],
    description: '',
    createdAt: new Date(),
  }),

  saveWord: word => {
    const exists = get().words.some(w => w.id === word.id);
    set(state => ({
      words: exists ? state.words.map(w => (w.id === word.id ? word : w)) : [...state.words, word],
    }));
    persist('save', () => wordUseCases.save.execute(word));
  },

  removeWord: id => {
    set(state => ({ words: state.words.filter(w => w.id !== id) }));
    persist('delete', () => wordUseCases.delete.execute(id));
  },

  filteredWords: () => {
    const { words, searchTerm } = get();
    const q = searchTerm.trim().toLowerCase();
    const list = q
      ? words.filter(w => w.label.toLowerCase().includes(q) || w.variants.some(v => v.toLowerCase().includes(q)))
      : words;
    return [...list].sort(byLabel);
  },
}));
