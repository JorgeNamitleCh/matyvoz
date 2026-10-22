import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// ARASAAC-inspired category palette
export const CAT = {
  persona: { bg: '#FFE66B', stroke: '#1f1a0a', label: 'PERSONA' },
  accion:  { bg: '#A8DC83', stroke: '#10210a', label: 'ACCIÓN'  },
  objeto:  { bg: '#FFB870', stroke: '#2a1808', label: 'OBJETO'  },
  lugar:   { bg: '#C9A8E2', stroke: '#1a0a2a', label: 'LUGAR'   },
  comida:  { bg: '#F5A8C0', stroke: '#2a0a1a', label: 'COMIDA'  },
  emocion: { bg: '#7FC4E8', stroke: '#0a1a2a', label: 'EMOCIÓN' },
  tiempo:  { bg: '#E8E0D0', stroke: '#2a2418', label: 'TIEMPO'  },
} as const;

export type CatKey = keyof typeof CAT;

// Swatches offered when the user creates a new custom category (e.g. in the
// catalog's "gestionar tipos" flow). Same ARASAAC-style bg/stroke pairing as
// CAT above, kept as a separate list so a brand-new category isn't forced to
// reuse one of the fixed CatKeys.
export const CATEGORY_SWATCHES: { bg: string; stroke: string }[] = [
  { bg: '#FFE66B', stroke: '#1f1a0a' },
  { bg: '#A8DC83', stroke: '#10210a' },
  { bg: '#FFB870', stroke: '#2a1808' },
  { bg: '#C9A8E2', stroke: '#1a0a2a' },
  { bg: '#F5A8C0', stroke: '#2a0a1a' },
  { bg: '#7FC4E8', stroke: '#0a1a2a' },
  { bg: '#E8E0D0', stroke: '#2a2418' },
  { bg: '#FFD1A6', stroke: '#2e1608' },
  { bg: '#B8E0D8', stroke: '#0a2420' },
  { bg: '#D8C4F0', stroke: '#1e0a2e' },
];

// Map pictogram kind to MaterialCommunityIcons name
const ICON_MAP: Record<string, string> = {
  sol:        'white-balance-sunny',
  luna:       'moon-waning-crescent',
  reloj:      'clock-outline',
  esperar:    'seat',
  comer:      'silverware-fork-knife',
  desayuno:   'silverware-fork-knife',
  merienda:   'cup',
  beber:      'cup-outline',
  banar:      'shower-head',
  lavar:      'hand-wash-outline',
  leer:       'book-open-page-variant',
  persona:    'account',
  visita:     'account-group',
  casa:       'home',
  cole:       'school',
  parque:     'tree',
  super:      'cart',
  dentista:   'tooth-outline',
  abuelos:    'human-male-female',
  jugar:      'soccer',
  corazon:    'heart',
  cumple:     'party-popper',
  check:      'check-bold',
  pregunta:   'help-circle-outline',
  mas:        'plus-circle-outline',
  // extra icons available for custom activities created from the catalog
  estrella:   'star',
  musica:     'music',
  television: 'television',
  telefono:   'phone',
  coche:      'car',
  bicicleta:  'bike',
  mascota:    'paw',
  medico:     'medical-bag',
  ropa:       'tshirt-crew',
  regalo:     'gift',
  pintar:     'palette',
  dormir2:    'bed',
  // historias sociales
  silla:      'seat',
  cepillo:    'toothbrush',
  tijeras:    'content-cut',
  vacuna:     'needle',
  saludar:    'hand-wave',
  feliz:      'emoticon-happy-outline',
  tranquilo:  'emoticon-neutral-outline',
  triste:     'emoticon-sad-outline',
  pastel:     'cake-variant',
  globo:      'balloon',
  dinero:     'cash',
  mochila:    'bag-personal',
  espejo:     'mirror',
  curita:     'bandage',
  agua:       'water',
  secador:    'hair-dryer',
  diente:     'tooth-outline',
  puerta:     'door-open',
  zapatos:    'shoe-sneaker',
  esperar2:   'hand-back-right',
  canasta:    'basket',
  fruta:      'food-apple',
  doctor:     'stethoscope',
  tina:       'bathtub-outline',
  amigos:     'account-group',
  menu:       'book-open-variant',
  pulgar:     'thumb-up-outline',
  oir:        'ear-hearing',
  // palabras / emociones
  enojado:    'emoticon-angry-outline',
  cansado:    'sleep',
  miedo:      'emoticon-frown-outline',
  galleta:    'cookie',
  // vocabulario núcleo (armar frases)
  yo:         'account',
  tu:         'hand-pointing-right',
  quiero:     'hand-extended-outline',
  noquiero:   'thumb-down-outline',
  ir:         'walk',
  tengo:      'hand-okay',
  estoy:      'emoticon-outline',
  si:         'check-circle-outline',
  no:         'close-circle-outline',
  mas2:       'plus-circle-outline',
  ayuda:      'lifebuoy',
  porfavor:   'hands-pray',
  gracias:    'hand-heart-outline',
  art:        'format-letter-case',
  con:        'link-variant',
};

/** Nombre de MaterialCommunityIcons para un `kind` de pictograma. */
export const iconNameFor = (kind: string): string => ICON_MAP[kind] ?? 'shape-outline';

// Every icon kind selectable in the "new activity" icon picker
export const ICON_CHOICES = Object.keys(ICON_MAP);

interface PictoIconProps {
  kind: string;
  cat?: CatKey;
  /** Overrides the CAT lookup — used for dynamic/custom categories that
   * aren't one of the fixed CatKeys (e.g. types the user created). */
  color?: { bg: string; stroke: string };
  /** Foto elegida por el usuario — si está presente, llena el recuadro
   * completo en vez de mostrar el ícono. */
  imageUri?: string;
  size?: number;
  label?: string;
  hideLabel?: boolean;
}

export default function PictoIcon({ kind, cat, color, imageUri, size = 64, label, hideLabel = false }: PictoIconProps) {
  const c = color ?? CAT[cat ?? 'persona'] ?? CAT.persona;
  const borderRadius = size * 0.22;
  const borderWidth = Math.max(2.5, size * 0.055);
  const iconSize = size * 0.58;
  const iconName = ICON_MAP[kind] ?? 'shape-outline';

  return (
    <View style={s.wrap}>
      <View style={[s.box, {
        width: size, height: size, borderRadius,
        backgroundColor: c.bg,
        borderWidth, borderColor: c.stroke,
        overflow: 'hidden',
      }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={s.image} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name={iconName} size={iconSize} color={c.stroke} />
        )}
      </View>
      {!hideLabel && label && (
        <Text style={[s.label, { fontSize: Math.max(10, size * 0.175), maxWidth: size + 8 }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  box: { alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  label: {
    fontWeight: '700',
    color: '#2a2a2a',
    textAlign: 'center',
    fontFamily: 'Atkinson Hyperlegible',
  },
});
