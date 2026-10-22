import { StoryStepKind } from '../../core/domain/entities';

/** Etiqueta y color de cada tipo de paso (paleta PECS de la app). */
export const KIND_META: Record<StoryStepKind, { label: string; bg: string; stroke: string }> = {
  lugar:   { label: 'LUGAR',   bg: '#C9A8E2', stroke: '#1a0a2a' },
  persona: { label: 'PERSONA', bg: '#FFE66B', stroke: '#1f1a0a' },
  accion:  { label: 'ACCIÓN',  bg: '#A8DC83', stroke: '#10210a' },
  emocion: { label: 'EMOCIÓN', bg: '#7FC4E8', stroke: '#0a1a2a' },
  objeto:  { label: 'OBJETO',  bg: '#FFB870', stroke: '#2a1808' },
  tiempo:  { label: 'TIEMPO',  bg: '#E8E0D0', stroke: '#2a2418' },
  comida:  { label: 'COMIDA',  bg: '#F5A8C0', stroke: '#2a0a1a' },
};

export const KIND_ORDER: StoryStepKind[] = ['lugar', 'persona', 'accion', 'emocion', 'objeto', 'tiempo', 'comida'];

/** Color de un pictograma de apoyo según su clave (aproximación por tipo). */
export function supportColor(key: string): { bg: string; stroke: string } {
  if (['persona', 'amigos', 'doctor', 'saludar', 'visita', 'abuelos'].includes(key)) return KIND_META.persona;
  if (['feliz', 'tranquilo', 'triste', 'corazon', 'pulgar', 'estrella'].includes(key)) return KIND_META.emocion;
  if (['casa', 'cole', 'parque', 'super', 'dentista', 'medico', 'silla', 'puerta'].includes(key)) return KIND_META.lugar;
  if (['reloj', 'sol', 'luna', 'esperar'].includes(key)) return KIND_META.tiempo;
  if (['comer', 'pastel', 'fruta', 'merienda', 'beber', 'desayuno'].includes(key)) return KIND_META.comida;
  if (['jugar', 'lavar', 'banar', 'leer', 'agua', 'cepillo', 'pintar'].includes(key)) return KIND_META.accion;
  return KIND_META.objeto;
}
