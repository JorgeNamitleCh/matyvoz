import { WordCategory } from '../entities';

/** Glosario inicial de la familia (se personaliza después con fotos y voz). */
export interface DefaultWord {
  key: string;
  label: string;
  category: WordCategory;
  iconKey: string;
  syllables: string;
  variants?: string[];
}

export const DEFAULT_WORDS: DefaultWord[] = [
  // Persona
  { key: 'mama',    label: 'mamá',     category: 'person',  iconKey: 'persona',   syllables: 'ma · má',      variants: ['mami', 'ma'] },
  { key: 'papa',    label: 'papá',     category: 'person',  iconKey: 'persona',   syllables: 'pa · pá',      variants: ['papi', 'pa'] },
  { key: 'abu',     label: 'abu',      category: 'person',  iconKey: 'abuelos',   syllables: 'a · bu',       variants: ['abuela', 'abuelo'] },
  { key: 'maestra', label: 'maestra',  category: 'person',  iconKey: 'persona',   syllables: 'ma · es · tra', variants: ['miss', 'profe'] },
  { key: 'amigos',  label: 'amigos',   category: 'person',  iconKey: 'amigos',    syllables: 'a · mi · gos' },
  // Acción
  { key: 'comer',   label: 'comer',    category: 'action',  iconKey: 'comer',     syllables: 'co · mer' },
  { key: 'jugar',   label: 'jugar',    category: 'action',  iconKey: 'jugar',     syllables: 'ju · gar' },
  { key: 'dormir',  label: 'dormir',   category: 'action',  iconKey: 'dormir2',   syllables: 'dor · mir' },
  { key: 'leer',    label: 'leer',     category: 'action',  iconKey: 'leer',      syllables: 'le · er' },
  { key: 'beber',   label: 'beber',    category: 'action',  iconKey: 'beber',     syllables: 'be · ber',     variants: ['tomar'] },
  { key: 'banarse', label: 'bañarme',  category: 'action',  iconKey: 'banar',     syllables: 'ba · ñar · me' },
  { key: 'pintar',  label: 'pintar',   category: 'action',  iconKey: 'pintar',    syllables: 'pin · tar' },
  { key: 'salir',   label: 'salir',    category: 'action',  iconKey: 'puerta',    syllables: 'sa · lir' },
  // Lugar
  { key: 'casa',     label: 'casa',     category: 'place',  iconKey: 'casa',      syllables: 'ca · sa' },
  { key: 'cole',     label: 'cole',     category: 'place',  iconKey: 'cole',      syllables: 'co · le',      variants: ['escuela'] },
  { key: 'parque',   label: 'parque',   category: 'place',  iconKey: 'parque',    syllables: 'par · que' },
  { key: 'dentista', label: 'dentista', category: 'place',  iconKey: 'dentista',  syllables: 'den · tis · ta' },
  { key: 'bano',     label: 'baño',     category: 'place',  iconKey: 'tina',      syllables: 'ba · ño' },
  // Emoción
  { key: 'feliz',     label: 'feliz',     category: 'emotion', iconKey: 'feliz',     syllables: 'fe · liz',      variants: ['contento'] },
  { key: 'triste',    label: 'triste',    category: 'emotion', iconKey: 'triste',    syllables: 'tris · te' },
  { key: 'tranquilo', label: 'tranquilo', category: 'emotion', iconKey: 'tranquilo', syllables: 'tran · qui · lo' },
  { key: 'enojado',   label: 'enojado',   category: 'emotion', iconKey: 'enojado',   syllables: 'e · no · ja · do' },
  { key: 'cansado',   label: 'cansado',   category: 'emotion', iconKey: 'cansado',   syllables: 'can · sa · do' },
  { key: 'miedo',     label: 'miedo',     category: 'emotion', iconKey: 'miedo',     syllables: 'mie · do' },
  // Cosas
  { key: 'pelota',  label: 'pelota',   category: 'object',  iconKey: 'jugar',     syllables: 'pe · lo · ta' },
  { key: 'libro',   label: 'libro',    category: 'object',  iconKey: 'leer',      syllables: 'li · bro' },
  { key: 'tele',    label: 'tele',     category: 'object',  iconKey: 'television', syllables: 'te · le' },
  { key: 'tablet',  label: 'tablet',   category: 'object',  iconKey: 'telefono',  syllables: 'ta · blet' },
  // Comida
  { key: 'agua',    label: 'agua',     category: 'food',    iconKey: 'agua',      syllables: 'a · gua' },
  { key: 'leche',   label: 'leche',    category: 'food',    iconKey: 'beber',     syllables: 'le · che' },
  { key: 'fruta',   label: 'fruta',    category: 'food',    iconKey: 'fruta',     syllables: 'fru · ta' },
  { key: 'galleta', label: 'galleta',  category: 'food',    iconKey: 'galleta',   syllables: 'ga · lle · ta' },
];

/** Vocabulario núcleo (CAA): palabras de alta frecuencia para armar frases. */
export interface CoreWord {
  label: string;
  iconKey: string;
  /** Tipo gramatical → color Fitzgerald */
  kind: 'pronoun' | 'verb' | 'social' | 'describe' | 'little';
}

export const CORE_WORDS: CoreWord[] = [
  { label: 'yo',       iconKey: 'yo',        kind: 'pronoun' },
  { label: 'tú',       iconKey: 'tu',        kind: 'pronoun' },
  { label: 'quiero',   iconKey: 'quiero',    kind: 'verb' },
  { label: 'no quiero', iconKey: 'noquiero', kind: 'verb' },
  { label: 'me gusta', iconKey: 'corazon',   kind: 'verb' },
  { label: 'voy a',    iconKey: 'ir',        kind: 'verb' },
  { label: 'tengo',    iconKey: 'tengo',     kind: 'verb' },
  { label: 'estoy',    iconKey: 'estoy',     kind: 'verb' },
  { label: 'sí',       iconKey: 'si',        kind: 'social' },
  { label: 'no',       iconKey: 'no',        kind: 'social' },
  { label: 'más',      iconKey: 'mas2',      kind: 'describe' },
  { label: 'ayuda',    iconKey: 'ayuda',     kind: 'social' },
  { label: 'por favor', iconKey: 'porfavor', kind: 'social' },
  { label: 'gracias',  iconKey: 'gracias',   kind: 'social' },
  { label: 'terminé',  iconKey: 'check',     kind: 'social' },
  { label: 'el',       iconKey: 'art',       kind: 'little' },
  { label: 'la',       iconKey: 'art',       kind: 'little' },
  { label: 'al',       iconKey: 'art',       kind: 'little' },
  { label: 'con',      iconKey: 'con',       kind: 'little' },
];
