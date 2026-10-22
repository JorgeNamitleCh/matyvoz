import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PictoIcon from '../pictograms/PictoIcon';
import { STORY_TEMPLATES, StoryTemplate } from '../../../core/domain/templates/storyTemplates';
import { KIND_META } from '../../utils/storyKinds';
import { SURFACE, INK, INK3, BORDER, LINE, ACCENT, PRIMARY, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

interface Props {
  title?: string;
  subtitle?: string;
  onCreate: () => void;
  onTemplate: (tpl: StoryTemplate) => void;
  onSeeTemplates: () => void;
}

/** Libro abierto con páginas-pictograma, como "historia en pasos". */
const PAGES = [
  { kind: 'lugar' as const,   icon: 'dentista', rotate: '-10deg', dy: 10 },
  { kind: 'persona' as const, icon: 'silla',    rotate: '-3deg',  dy: 0 },
  { kind: 'emocion' as const, icon: 'feliz',    rotate: '6deg',   dy: 4 },
];

const QUICK = ['tpl-dentista', 'tpl-dormir', 'tpl-cole', 'tpl-pelo'];

/** Estado vacío de la biblioteca de historias. */
export default function EmptyStoriesState({
  title = 'Crea su primera historia',
  subtitle = 'Cuenta paso a paso lo que va a pasar, con vuestras fotos. Así llega preparado y tranquilo.',
  onCreate, onTemplate, onSeeTemplates,
}: Props) {
  const quick = STORY_TEMPLATES.filter(t => QUICK.includes(t.id));

  return (
    <View style={s.root}>
      <View style={s.fan}>
        {PAGES.map((p, i) => (
          <View
            key={p.icon}
            style={[s.page, { transform: [{ rotate: p.rotate }, { translateY: p.dy }], zIndex: i === 1 ? 2 : 1 }]}
          >
            <View style={s.pageNum}><Text style={s.pageNumText}>{i + 1}</Text></View>
            <PictoIcon kind={p.icon} color={KIND_META[p.kind]} size={58} hideLabel />
            <View style={s.pageLine} />
            <View style={[s.pageLine, s.pageLineShort]} />
          </View>
        ))}
      </View>

      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>

      <TouchableOpacity style={s.cta} onPress={onCreate} activeOpacity={0.85}>
        <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        <Text style={s.ctaText}>Crear historia</Text>
      </TouchableOpacity>

      <View style={s.quick}>
        <Text style={s.quickLabel}>O EMPIEZA CON UNA PLANTILLA</Text>
        <View style={s.quickRow}>
          {quick.map(t => (
            <TouchableOpacity key={t.id} style={s.chip} onPress={() => onTemplate(t)} activeOpacity={0.8}>
              <PictoIcon kind={t.iconKey} color={KIND_META[t.kind]} size={28} hideLabel />
              <Text style={s.chipText} numberOfLines={1}>{t.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={onSeeTemplates} hitSlop={8}>
          <Text style={s.more}>Ver todas las plantillas →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = themedStyles(() => ({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },

  fan: { flexDirection: 'row', height: 132, marginBottom: 22 },
  page: {
    width: 92, height: 120, marginHorizontal: -6, backgroundColor: SURFACE, borderRadius: 14,
    borderWidth: 2, borderColor: INK, alignItems: 'center', paddingTop: 12, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  pageNum: {
    position: 'absolute', top: -9, left: -9, width: 22, height: 22, borderRadius: 11, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  pageNumText: { fontFamily: FONT_DISP, fontSize: 12, fontWeight: '800', color: '#fff' },
  pageLine: { width: 60, height: 5, borderRadius: 3, backgroundColor: LINE },
  pageLineShort: { width: 40 },

  title: { fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', color: INK, textAlign: 'center' },
  subtitle: {
    fontFamily: FONT_BODY, fontSize: 15, fontWeight: '600', color: INK3,
    textAlign: 'center', lineHeight: 21, marginTop: 8, maxWidth: 310,
  },

  cta: {
    marginTop: 22, height: 56, paddingHorizontal: 26, borderRadius: 28,
    backgroundColor: PRIMARY, flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  ctaText: { fontFamily: FONT_DISP, fontSize: 17, fontWeight: '800', color: '#fff' },

  quick: { marginTop: 26, alignItems: 'center', width: '100%' },
  quickLabel: { fontFamily: FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: INK3, marginBottom: 10 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: SURFACE, borderRadius: 999, borderWidth: 1.5, borderColor: BORDER,
    paddingLeft: 6, paddingRight: 14, paddingVertical: 6,
  },
  chipText: { fontFamily: FONT_BODY, fontSize: 14, fontWeight: '800', color: INK },
  more: { fontFamily: FONT_BODY, fontSize: 13, fontWeight: '800', color: ACCENT, marginTop: 14 },
}));
