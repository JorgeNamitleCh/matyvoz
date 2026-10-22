export type StoryMediaType = 'photo' | 'video' | 'pictogram';

/** Categoría visual de un paso (define color y etiqueta, ej. "LUGAR"). */
export type StoryStepKind = 'lugar' | 'persona' | 'accion' | 'emocion' | 'objeto' | 'tiempo' | 'comida';

export interface StoryStep {
  id: string;
  order: number;
  kind: StoryStepKind;
  mediaType: StoryMediaType;
  /** Foto propia (data URI comprimida) */
  mediaUrl?: string;
  /** Clave de pictograma (ICON_MAP) — se usa si no hay foto */
  pictogramKey: string;
  /** Frase del paso, ej. "Me siento en la silla." */
  text: string;
  /** Pictogramas de apoyo (claves de ICON_MAP) */
  supportPictograms: string[];
  audioUrl?: string;
}

export type StoryCategory = 'rutina' | 'salud' | 'social';

export interface Story {
  id: string;
  familyId: string;
  childId?: string;
  title: string;
  /** Pictograma de portada */
  iconKey: string;
  color: { bg: string; stroke: string };
  category: StoryCategory;
  steps: StoryStep[];
  /** Texto corto de cuándo se usa, ej. "jue", "diario" */
  when?: string;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
  isDraft: boolean;
  isPinned: boolean;
  isShared: boolean;
}
