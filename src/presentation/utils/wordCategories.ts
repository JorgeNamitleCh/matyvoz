import { WordCategory } from '../../core/domain/entities';

/** Secciones del glosario: etiqueta y color (código Fitzgerald / PECS). */
export const WORD_SECTIONS: { key: WordCategory; label: string; title: string; bg: string; stroke: string }[] = [
  { key: 'person',  label: 'PERSONA', title: 'Persona', bg: '#FFE66B', stroke: '#1f1a0a' },
  { key: 'action',  label: 'ACCIÓN',  title: 'Acción',  bg: '#A8DC83', stroke: '#10210a' },
  { key: 'place',   label: 'LUGAR',   title: 'Lugar',   bg: '#C9A8E2', stroke: '#1a0a2a' },
  { key: 'emotion', label: 'EMOCIÓN', title: 'Emoción', bg: '#7FC4E8', stroke: '#0a1a2a' },
  { key: 'object',  label: 'COSAS',   title: 'Cosas',   bg: '#FFB870', stroke: '#2a1808' },
  { key: 'food',    label: 'COMIDA',  title: 'Comida',  bg: '#F5A8C0', stroke: '#2a0a1a' },
];

export const sectionOf = (c: WordCategory) => WORD_SECTIONS.find(s => s.key === c) ?? WORD_SECTIONS[4];

/** Colores del vocabulario núcleo por tipo gramatical. */
export const CORE_COLORS = {
  pronoun:  { bg: '#FFE66B', stroke: '#1f1a0a' },
  verb:     { bg: '#A8DC83', stroke: '#10210a' },
  social:   { bg: '#F5A8C0', stroke: '#2a0a1a' },
  describe: { bg: '#7FC4E8', stroke: '#0a1a2a' },
  little:   { bg: '#FFFFFF', stroke: '#231B2E' },
} as const;
