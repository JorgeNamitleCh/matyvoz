/** Secciones PECS del glosario (código de color Fitzgerald). */
export type WordCategory = 'person' | 'action' | 'place' | 'emotion' | 'object' | 'food';

export interface Word {
  id: string;
  familyId: string;
  label: string;
  category: WordCategory;
  /** Pictograma (clave de ICON_MAP) si no hay foto */
  iconKey: string;
  /** Foto propia (data URI comprimida) */
  photoUrl?: string;
  /** Grabación de la familia diciendo la palabra (archivo local) */
  audioUrl?: string;
  /** Línea corta bajo el nombre, ej. "Marta · 38" */
  subtitle?: string;
  /** Ej. "ma · má" */
  syllables: string;
  variants: string[];
  description: string;
  createdAt: Date;
}
