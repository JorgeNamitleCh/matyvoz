import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StoriesScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { GetTemplatesUseCase } from '../../../core/domain/usecases/story/GetTemplatesUseCase';
import { StoryCategory } from '../../../core/domain/entities';
import { useStoriesStore } from '../../stores/useStoriesStore';
import { KIND_META } from '../../utils/storyKinds';
import { T } from '../time/timeShared';

type Props = StoriesScreenProps<'Templates'>;

const templates = new GetTemplatesUseCase().execute();

const FILTERS: { key: 'todas' | StoryCategory; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'rutina', label: 'Rutina' },
  { key: 'salud', label: 'Salud' },
  { key: 'social', label: 'Social' },
];

const GAP = 10;
const CARD_W = (Dimensions.get('window').width - 32 - GAP * 2) / 3;

export default function TemplatesScreen({ navigation }: Props) {
  const createFromTemplate = useStoriesStore(s => s.createFromTemplate);
  const [filter, setFilter] = useState<'todas' | StoryCategory>('todas');
  const list = templates.filter(t => filter === 'todas' || t.category === filter);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Regresar">
          <MaterialCommunityIcons name="arrow-left" size={22} color={T.INK} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Plantillas</Text>
          <Text style={s.subtitle}>Personaliza con vuestras fotos</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters} contentContainerStyle={s.filtersContent}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <TouchableOpacity key={f.key} style={[s.chip, active && s.chipActive]} onPress={() => setFilter(f.key)}>
              <Text style={[s.chipText, active && s.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
        {list.map(t => (
          <TouchableOpacity
            key={t.id}
            style={s.card}
            activeOpacity={0.85}
            onPress={() => {
              const story = createFromTemplate(t);
              navigation.navigate('StoryEditor', { storyId: story.id });
            }}
          >
            <PictoIcon kind={t.iconKey} color={KIND_META[t.kind]} size={58} hideLabel />
            <Text style={s.cardTitle} numberOfLines={2}>{t.title}</Text>
            <Text style={s.cardSub}>{t.steps.length} PASOS</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.scratchBtn} onPress={() => navigation.navigate('StoryEditor', {})} activeOpacity={0.85}>
          <Text style={s.scratchText}>+ Crear historia desde cero</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: T.CARD,
    borderWidth: 1.5, borderColor: T.BORDER, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: T.FONT_DISP, fontSize: 24, fontWeight: '800', color: T.INK },
  subtitle: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '600', color: T.INK3 },

  filters: { flexGrow: 0, flexShrink: 0, marginBottom: 12 },
  filtersContent: { gap: 6, paddingHorizontal: 16, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: T.CARD, borderWidth: 1.5, borderColor: T.BORDER,
  },
  chipActive: { backgroundColor: T.INK, borderColor: T.INK },
  chipText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK },
  chipTextActive: { color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    width: CARD_W, minHeight: CARD_W * 1.28, backgroundColor: T.CARD, borderRadius: 16,
    alignItems: 'center', paddingTop: 16, paddingHorizontal: 8, paddingBottom: 12,
  },
  cardTitle: { fontFamily: T.FONT_DISP, fontSize: 13, fontWeight: '800', color: T.INK, textAlign: 'center', marginTop: 10 },
  cardSub: { fontFamily: T.FONT_BODY, fontSize: 9, fontWeight: '800', letterSpacing: 0.6, color: T.INK3, marginTop: 4 },

  footer: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 6 },
  scratchBtn: { height: 56, borderRadius: 14, backgroundColor: T.INK, alignItems: 'center', justifyContent: 'center' },
  scratchText: { fontFamily: T.FONT_DISP, fontSize: 16, fontWeight: '800', color: '#fff' },
});
