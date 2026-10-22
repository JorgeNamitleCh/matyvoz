import {
  CommunicationType, Neurodivergence, ProfileType, Sensitivity, SupportType,
} from '../../core/domain/entities';

/** Textos e íconos (MaterialCommunityIcons) para mostrar y editar el perfil. */

export const PROFILE_TYPES: { key: ProfileType; label: string; desc: string; icon: string }[] = [
  { key: 'child', label: 'Un niño o niña', desc: 'Lo usa la familia con su peque', icon: 'account-child-outline' },
  { key: 'adult', label: 'Una persona adulta', desc: 'Para un adulto o para ti', icon: 'account-outline' },
];

export const NEUROS: { key: Neurodivergence; label: string; desc: string }[] = [
  { key: 'ASD', label: 'TEA', desc: 'Espectro autista' },
  { key: 'ADHD', label: 'TDAH', desc: 'Atención' },
  { key: 'SLD', label: 'TEL', desc: 'Lenguaje' },
  { key: 'DS', label: 'SD', desc: 'Síndrome de Down' },
  { key: 'other', label: 'Otra', desc: 'Otra condición' },
];

export const COMMUNICATIONS: { key: CommunicationType; label: string }[] = [
  { key: 'verbal', label: 'Verbal' },
  { key: 'mixed', label: 'Mixta' },
  { key: 'nonverbal', label: 'No verbal' },
];

export const SENSITIVITIES: { key: Sensitivity; label: string; icon: string }[] = [
  { key: 'sounds', label: 'Sonidos', icon: 'volume-high' },
  { key: 'lights', label: 'Luces', icon: 'lightbulb-on-outline' },
  { key: 'textures', label: 'Texturas', icon: 'hand-back-right-outline' },
  { key: 'crowds', label: 'Multitud', icon: 'account-group-outline' },
  { key: 'changes', label: 'Cambios', icon: 'swap-horizontal' },
];

export const SUPPORTS: { key: SupportType; label: string; icon: string }[] = [
  { key: 'pictograms', label: 'Pictogramas', icon: 'shape-outline' },
  { key: 'realPhotos', label: 'Fotos reales', icon: 'image-outline' },
  { key: 'both', label: 'Ambos', icon: 'image-multiple-outline' },
  { key: 'noImage', label: 'Solo texto', icon: 'format-text' },
];

export const RELATIONS = ['Madre', 'Padre', 'Cuidador', 'Abu', 'Tutor', 'Otro', 'Yo mismo/a'];

export function labelOf<K extends string>(list: { key: K; label: string }[], key: K | undefined): string {
  return list.find(o => o.key === key)?.label ?? '—';
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
}
