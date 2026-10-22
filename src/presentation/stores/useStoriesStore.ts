import { create } from 'zustand';
import { Story, StoryStep } from '../../core/domain/entities';
import { StoryTemplate } from '../../core/domain/templates/storyTemplates';
import { storyUseCases } from '../../infrastructure/di/container';
import { useAuthStore } from './useAuthStore';
import { useSyncStatusStore } from './useSyncStatusStore';
import { newId } from '../utils/newId';
import { KIND_META } from '../utils/storyKinds';

/**
 * Historias sociales de la familia, guardadas en Firestore (`stories`).
 * La UI se actualiza al instante y el guardado ocurre en segundo plano.
 */

interface StoriesState {
  stories: Story[];
  loaded: boolean;
  load: (familyId: string) => Promise<void>;
  reset: () => void;
  /** Crea o reemplaza una historia completa. */
  saveStory: (story: Story) => void;
  togglePin: (id: string) => void;
  removeStory: (id: string) => void;
  /** Nueva historia vacía (borrador, aún no guardada). */
  newBlankStory: () => Story;
  /** Copia de una plantilla como borrador (se guarda de inmediato). */
  createFromTemplate: (tpl: StoryTemplate) => Story;
}

export function newStep(order: number): StoryStep {
  return {
    id: newId('st-'),
    order,
    kind: 'lugar',
    mediaType: 'pictogram',
    pictogramKey: 'estrella',
    text: '',
    supportPictograms: [],
  };
}

function persist(label: string, work: () => Promise<void>) {
  if (!useAuthStore.getState().family) return;
  work().catch(err => useSyncStatusStore.getState().report(`stories.${label}`, err));
}

const sortStories = (list: Story[]) =>
  [...list].sort((a, b) =>
    a.isPinned === b.isPinned ? b.updatedAt.getTime() - a.updatedAt.getTime() : a.isPinned ? -1 : 1,
  );

export const useStoriesStore = create<StoriesState>((set, get) => ({
  stories: [],
  loaded: false,

  load: async familyId => {
    try {
      const stories = await storyUseCases.get.execute(familyId);
      set({ stories, loaded: true });
    } catch (err) {
      useSyncStatusStore.getState().report('stories.load', err);
      set({ loaded: true });
    }
  },

  reset: () => set({ stories: [], loaded: false }),

  saveStory: story => {
    const updated = { ...story, updatedAt: new Date() };
    const exists = get().stories.some(s => s.id === story.id);
    set(state => ({
      stories: sortStories(exists ? state.stories.map(s => (s.id === story.id ? updated : s)) : [...state.stories, updated]),
    }));
    persist('save', () => storyUseCases.save.execute(updated));
  },

  togglePin: id => {
    const story = get().stories.find(s => s.id === id);
    if (!story) return;
    const isPinned = !story.isPinned;
    set(state => ({ stories: sortStories(state.stories.map(s => (s.id === id ? { ...s, isPinned } : s))) }));
    persist('pin', () => storyUseCases.update.execute(id, { isPinned }));
  },

  removeStory: id => {
    set(state => ({ stories: state.stories.filter(s => s.id !== id) }));
    persist('delete', () => storyUseCases.delete.execute(id));
  },

  newBlankStory: () => {
    const now = new Date();
    return {
      id: newId('story-'),
      familyId: useAuthStore.getState().family?.id ?? '',
      title: '',
      iconKey: 'leer',
      color: { bg: KIND_META.lugar.bg, stroke: KIND_META.lugar.stroke },
      category: 'rutina',
      steps: [newStep(0)],
      createdAt: now,
      updatedAt: now,
      isDraft: true,
      isPinned: false,
      isShared: false,
    };
  },

  createFromTemplate: tpl => {
    const now = new Date();
    const meta = KIND_META[tpl.kind];
    const story: Story = {
      id: newId('story-'),
      familyId: useAuthStore.getState().family?.id ?? '',
      title: tpl.title,
      iconKey: tpl.iconKey,
      color: { bg: meta.bg, stroke: meta.stroke },
      category: tpl.category,
      templateId: tpl.id,
      steps: tpl.steps.map((st, i) => ({
        id: newId('st-'),
        order: i,
        kind: st.kind,
        mediaType: 'pictogram',
        pictogramKey: st.pictogramKey,
        text: st.text,
        supportPictograms: st.support,
      })),
      createdAt: now,
      updatedAt: now,
      isDraft: true,
      isPinned: false,
      isShared: false,
    };
    get().saveStory(story);
    return story;
  },
}));
