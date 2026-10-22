import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, LayoutAnimation,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StoriesScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import EmptyStoriesState from '../../components/stories/EmptyStoriesState';
import { useStoriesStore } from '../../stores/useStoriesStore';
import { useChildStore } from '../../stores/useChildStore';
import { useDayStore } from '../../stores/useDayStore';
import { useDialog } from '../../providers/DialogProvider';
import { Story } from '../../../core/domain/entities';
import { T } from '../time/timeShared';

type Props = StoriesScreenProps<'StoriesLibrary'>;
type Filter = 'todas' | 'fijadas' | 'borradores' | 'compartidas';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'fijadas', label: 'Fijadas' },
  { key: 'borradores', label: 'Borradores' },
  { key: 'compartidas', label: 'Compartidas' },
];

const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const ACTION_W = 72;

/** "6 pasos · jue" / "5 pasos · borrador" */
function subtitleOf(st: Story): string {
  const pasos = `${st.steps.length} ${st.steps.length === 1 ? 'paso' : 'pasos'}`;
  if (st.isDraft) return `${pasos} · borrador`;
  if (st.when) return `${pasos} · ${st.when}`;
  return `${pasos} · ${DAYS[st.updatedAt.getDay()]}`;
}

export default function StoriesLibraryScreen({ navigation }: Props) {
  const stories = useStoriesStore(s => s.stories);
  const loaded = useStoriesStore(s => s.loaded);
  const togglePin = useStoriesStore(s => s.togglePin);
  const removeStory = useStoriesStore(s => s.removeStory);
  const createFromTemplate = useStoriesStore(s => s.createFromTemplate);
  const child = useChildStore(s => s.currentChild);
  const dayItems = useDayStore(s => s.items);
  const { showDialog } = useDialog();
  const [filter, setFilter] = useState<Filter>('todas');
  const swipeRefs = useRef<Map<string, Swipeable>>(new Map());

  // "HOY": la historia que corresponde a lo que toca hoy en Mi día; si no, la fijada.
  const upcoming = dayItems.filter(it => it.state !== 'done').map(it => it.label.toLowerCase());
  const today =
    stories.find(st => !st.isDraft && upcoming.some(l => st.title.toLowerCase().includes(l) || l.includes(st.title.toLowerCase()))) ??
    stories.find(st => st.isPinned && !st.isDraft);

  const visible = stories.filter(st =>
    filter === 'fijadas' ? st.isPinned
      : filter === 'borradores' ? st.isDraft
        : filter === 'compartidas' ? st.isShared
          : true,
  );

  const kicker = child ? `${child.name.toUpperCase()} · ${child.age} AÑOS` : 'MIS HISTORIAS';

  function confirmDelete(st: Story) {
    swipeRefs.current.get(st.id)?.close();
    showDialog({
      title: 'Eliminar historia',
      message: `¿Eliminar "${st.title || 'Sin título'}"? No se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            removeStory(st.id);
          },
        },
      ],
    });
  }

  function renderActions(st: Story, progress: Animated.AnimatedInterpolation<number>) {
    const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [ACTION_W * 3, 0] });
    const act = (icon: string, label: string, bg: string, onPress: () => void) => (
      <TouchableOpacity style={[s.action, { backgroundColor: bg }]} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={20} color="#fff" />
        <Text style={s.actionText}>{label}</Text>
      </TouchableOpacity>
    );
    return (
      <Animated.View style={[s.actions, { transform: [{ translateX }] }]}>
        {act('pencil-outline', 'Editar', T.ACCENT, () => {
          swipeRefs.current.get(st.id)?.close();
          navigation.navigate('StoryEditor', { storyId: st.id });
        })}
        {act(st.isPinned ? 'pin-off-outline' : 'pin-outline', st.isPinned ? 'Soltar' : 'Fijar', '#8A6D1E', () => {
          swipeRefs.current.get(st.id)?.close();
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          togglePin(st.id);
        })}
        {act('trash-can-outline', 'Eliminar', '#B23B3B', () => confirmDelete(st))}
      </Animated.View>
    );
  }

  const isEmpty = loaded && stories.length === 0;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.flex}>
          <Text style={s.kicker}>{kicker}</Text>
          <Text style={s.title}>Historias</Text>
        </View>
        <TouchableOpacity style={s.newBtn} onPress={() => navigation.navigate('StoryEditor', {})}>
          <Text style={s.newText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <ScrollView contentContainerStyle={s.emptyWrap}>
          <EmptyStoriesState
            onCreate={() => navigation.navigate('StoryEditor', {})}
            onSeeTemplates={() => navigation.navigate('Templates')}
            onTemplate={tpl => {
              const st = createFromTemplate(tpl);
              navigation.navigate('StoryEditor', { storyId: st.id });
            }}
          />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Hoy + Plantillas */}
          <View style={s.topRow}>
            <TouchableOpacity
              style={s.todayCard}
              activeOpacity={0.85}
              disabled={!today}
              onPress={() => today && navigation.navigate('StoryReader', { storyId: today.id })}
            >
              <View style={s.todayIcon}>
                {today ? (
                  <PictoIcon kind={today.iconKey} color={{ bg: '#F3E9D6', stroke: T.INK }} size={38} hideLabel />
                ) : (
                  <MaterialCommunityIcons name="clock-outline" size={22} color={T.INK} />
                )}
              </View>
              <View style={s.flex}>
                <Text style={s.todayKicker}>HOY</Text>
                <Text style={s.todayTitle} numberOfLines={1}>{today ? today.title : 'Fija una historia'}</Text>
              </View>
              {today && <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />}
            </TouchableOpacity>
            <TouchableOpacity style={s.tplCard} activeOpacity={0.85} onPress={() => navigation.navigate('Templates')}>
              <View style={s.tplIcon}>
                <MaterialCommunityIcons name="plus" size={22} color="#10210a" />
              </View>
              <Text style={s.tplText}>Plantillas</Text>
            </TouchableOpacity>
          </View>

          {/* Filtros */}
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

          {visible.length === 0 && (
            <View style={s.filterEmpty}>
              <MaterialCommunityIcons
                name={filter === 'fijadas' ? 'pin-outline' : filter === 'borradores' ? 'file-document-edit-outline' : 'share-variant-outline'}
                size={32}
                color={T.INK3}
              />
              <Text style={s.filterEmptyText}>
                {filter === 'fijadas'
                  ? 'Desliza una historia a la izquierda y toca Fijar.'
                  : filter === 'borradores'
                    ? 'No tienes borradores.'
                    : 'Todavía no compartes historias.'}
              </Text>
            </View>
          )}

          {/* Lista */}
          {visible.map(st => (
            <Swipeable
              key={st.id}
              ref={r => {
                if (r) swipeRefs.current.set(st.id, r);
                else swipeRefs.current.delete(st.id);
              }}
              friction={2}
              rightThreshold={40}
              overshootRight={false}
              renderRightActions={p => renderActions(st, p)}
              containerStyle={s.rowWrap}
            >
              <TouchableOpacity
                style={s.row}
                activeOpacity={0.85}
                onPress={() =>
                  st.isDraft
                    ? navigation.navigate('StoryEditor', { storyId: st.id })
                    : navigation.navigate('StoryReader', { storyId: st.id })
                }
              >
                <View style={[s.rowStrip, { backgroundColor: st.color.stroke }]} />
                <PictoIcon kind={st.iconKey} color={st.color} size={46} hideLabel />
                <View style={s.flex}>
                  <View style={s.rowTitleLine}>
                    <Text style={s.rowTitle} numberOfLines={1}>{st.title || 'Sin título'}</Text>
                    {st.isPinned && <MaterialCommunityIcons name="pin" size={14} color="#C0392B" />}
                  </View>
                  <Text style={s.rowSub}>{subtitleOf(st)}</Text>
                </View>
                <View style={s.chevron}>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={T.INK} />
                </View>
              </TouchableOpacity>
            </Swipeable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.BG },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  kicker: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: T.INK3 },
  title: { fontFamily: T.FONT_DISP, fontSize: 28, fontWeight: '800', color: T.INK },
  newBtn: { backgroundColor: T.INK, borderRadius: 10, paddingHorizontal: 14, height: 40, justifyContent: 'center' },
  newText: { fontFamily: T.FONT_DISP, fontSize: 14, fontWeight: '800', color: '#fff' },

  content: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyWrap: { flexGrow: 1 },

  topRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  todayCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.INK, borderRadius: 14, padding: 12, minHeight: 68,
  },
  todayIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3E9D6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  todayKicker: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: 'rgba(255,255,255,0.7)' },
  todayTitle: { fontFamily: T.FONT_DISP, fontSize: 15, fontWeight: '800', color: '#fff' },
  tplCard: {
    width: 90, backgroundColor: T.CARD, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1.5, borderColor: T.BORDER,
  },
  tplIcon: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#A8DC83', borderWidth: 2, borderColor: '#10210a',
    alignItems: 'center', justifyContent: 'center',
  },
  tplText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK },

  filters: { flexGrow: 0, flexShrink: 0, marginBottom: 12 },
  filtersContent: { gap: 6, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: T.CARD, borderWidth: 1.5, borderColor: T.BORDER,
  },
  chipActive: { backgroundColor: T.INK, borderColor: T.INK },
  chipText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK },
  chipTextActive: { color: '#fff' },

  filterEmpty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  filterEmptyText: { fontFamily: T.FONT_BODY, fontSize: 14, fontWeight: '600', color: T.INK3, textAlign: 'center' },

  rowWrap: { marginBottom: 10, borderRadius: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.CARD, borderRadius: 16, paddingVertical: 12, paddingRight: 12, paddingLeft: 16,
    overflow: 'hidden',
  },
  rowStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: { fontFamily: T.FONT_DISP, fontSize: 16, fontWeight: '800', color: T.INK, flexShrink: 1 },
  rowSub: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '700', color: T.INK3, marginTop: 2 },
  chevron: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F1EFEA', alignItems: 'center', justifyContent: 'center' },

  actions: { flexDirection: 'row', marginLeft: 6 },
  action: { width: ACTION_W, marginLeft: 6, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 3 },
  actionText: { fontFamily: T.FONT_DISP, fontSize: 11, fontWeight: '800', color: '#fff' },
});
