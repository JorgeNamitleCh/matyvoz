import { Story, StoryStep } from '../../core/domain/entities';
import { stripUndefined } from './CatalogMapper';

function stepFrom(raw: Record<string, any>, i: number): StoryStep {
  return {
    id: raw.id ?? `s${i}`,
    order: raw.order ?? i,
    kind: raw.kind ?? 'lugar',
    mediaType: raw.mediaType ?? (raw.mediaUrl ? 'photo' : 'pictogram'),
    mediaUrl: raw.mediaUrl ?? undefined,
    pictogramKey: raw.pictogramKey ?? 'estrella',
    text: raw.text ?? '',
    supportPictograms: Array.isArray(raw.supportPictograms) ? raw.supportPictograms : [],
    audioUrl: raw.audioUrl ?? undefined,
  };
}

export const StoryMapper = {
  fromFirestore(id: string, data: Record<string, any>): Story {
    return {
      id,
      familyId: data.familyId,
      childId: data.childId ?? undefined,
      title: data.title ?? 'Historia',
      iconKey: data.iconKey ?? 'leer',
      color: data.color ?? { bg: '#C9A8E2', stroke: '#1a0a2a' },
      category: data.category ?? 'rutina',
      steps: (Array.isArray(data.steps) ? data.steps : []).map(stepFrom).sort((a, b) => a.order - b.order),
      when: data.when ?? undefined,
      templateId: data.templateId ?? undefined,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? data.createdAt?.toDate?.() ?? new Date(),
      isDraft: data.isDraft ?? false,
      isPinned: data.isPinned ?? false,
      isShared: data.isShared ?? false,
    };
  },

  toFirestore(story: Story): Record<string, unknown> {
    const { id: _ignored, ...rest } = story;
    void _ignored;
    return stripUndefined({
      ...rest,
      steps: story.steps.map((st, i) => stripUndefined({ ...st, order: i })),
    } as Record<string, unknown>);
  },
};
