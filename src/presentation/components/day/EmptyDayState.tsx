import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PictoIcon, { CAT } from '../pictograms/PictoIcon';
import { useCatalogStore } from '../../stores/useCatalogStore';
import { SURFACE, INK, INK3, BORDER, PRIMARY, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

interface Props {
  onAdd: () => void;
  onQuickPick: (catalogItemId: string) => void;
}

/** Abanico de pictogramas que "anticipa" cómo se verá el día. */
const FAN: { kind: string; color: { bg: string; stroke: string }; rotate: string; dy: number }[] = [
  { kind: 'sol',   color: CAT.persona, rotate: '-14deg', dy: 14 },
  { kind: 'comer', color: CAT.accion,  rotate: '-5deg',  dy: 0 },
  { kind: 'cole',  color: CAT.lugar,   rotate: '5deg',   dy: 0 },
  { kind: 'luna',  color: CAT.emocion, rotate: '14deg',  dy: 14 },
];

/**
 * Estado vacío de "Mi día": ilustración con pictogramas, mensaje corto,
 * botón principal y sugerencias rápidas tomadas del catálogo.
 */
export default function EmptyDayState({ onAdd, onQuickPick }: Props) {
  const categories = useCatalogStore(state => state.categories);
  const items = useCatalogStore(state => state.items);

  // Una sugerencia por categoría (máx. 4) para arrancar rápido.
  const suggestions = categories
    .map(c => items.find(it => it.categoryId === c.id))
    .filter((it): it is NonNullable<typeof it> => !!it)
    .slice(0, 4);

  return (
    <View style={s.root}>
      <View style={s.fan}>
        {FAN.map((f, i) => (
          <View
            key={f.kind}
            style={[s.fanTile, { transform: [{ rotate: f.rotate }, { translateY: f.dy }], zIndex: i === 1 || i === 2 ? 2 : 1 }]}
          >
            <PictoIcon kind={f.kind} color={f.color} size={64} hideLabel />
          </View>
        ))}
      </View>

      <Text style={s.title}>Arma el día de hoy</Text>
      <Text style={s.subtitle}>
        Añade las actividades en orden para que tu peque sepa qué viene después.
      </Text>

      <TouchableOpacity style={s.cta} onPress={onAdd} activeOpacity={0.85}>
        <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        <Text style={s.ctaText}>Añadir actividad</Text>
      </TouchableOpacity>

      {suggestions.length > 0 && (
        <View style={s.quick}>
          <Text style={s.quickLabel}>O EMPIEZA CON</Text>
          <View style={s.quickRow}>
            {suggestions.map(it => {
              const cat = categories.find(c => c.id === it.categoryId);
              const color = cat ? { bg: cat.bg, stroke: cat.stroke } : CAT.tiempo;
              return (
                <TouchableOpacity
                  key={it.id}
                  style={s.chip}
                  onPress={() => onQuickPick(it.id)}
                  activeOpacity={0.8}
                >
                  <PictoIcon kind={it.iconKey} imageUri={it.imageUri} color={color} size={28} hideLabel />
                  <Text style={s.chipText} numberOfLines={1}>
                    {it.label.charAt(0).toUpperCase() + it.label.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const s = themedStyles(() => ({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 40 },

  fan: { flexDirection: 'row', alignItems: 'flex-start', height: 96, marginBottom: 26 },
  fanTile: {
    marginHorizontal: -6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },

  title: { fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', color: INK, textAlign: 'center' },
  subtitle: {
    fontFamily: FONT_BODY, fontSize: 15, fontWeight: '600', color: INK3,
    textAlign: 'center', lineHeight: 21, marginTop: 8, maxWidth: 300,
  },

  cta: {
    marginTop: 24, height: 56, paddingHorizontal: 26, borderRadius: 28,
    backgroundColor: PRIMARY, flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  ctaText: { fontFamily: FONT_DISP, fontSize: 17, fontWeight: '800', color: '#fff' },

  quick: { marginTop: 30, alignItems: 'center', width: '100%' },
  quickLabel: { fontFamily: FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: INK3, marginBottom: 10 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: SURFACE, borderRadius: 999, borderWidth: 1.5, borderColor: BORDER,
    paddingLeft: 6, paddingRight: 14, paddingVertical: 6,
  },
  chipText: { fontFamily: FONT_BODY, fontSize: 14, fontWeight: '800', color: INK },
}));
