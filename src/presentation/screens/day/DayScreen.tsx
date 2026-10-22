import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, LayoutAnimation, ActivityIndicator,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DayScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { useDayStore, DayItem } from '../../stores/useDayStore';
import { useDialog } from '../../providers/DialogProvider';
import TimeEditModal from '../../components/common/TimeEditModal';
import { formatShortTime } from '../../components/common/TimeOfDayPicker';
import EmptyDayState from '../../components/day/EmptyDayState';
import DayCardsView from '../../components/day/DayCardsView';

type Props = DayScreenProps<'Day'>;

const BG = '#EFEEEA';
const INK = '#2D2620';
const ACCENT = '#2A5F8F';
const DANGER = '#B23B3B';
const BORDER = 'rgba(0,0,0,0.08)';
const INK3 = '#8a8a8a';
const INK2 = '#4a4a4a';
const FONT_DISP = 'Nunito ExtraLight';
const FONT_BODY = 'Atkinson Hyperlegible';

const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const ACTION_W = 78;

export default function DayScreen({ navigation }: Props) {
  const items = useDayStore(state => state.items);
  const loading = useDayStore(state => state.loading);
  const isEmpty = items.length === 0;
  const viewMode = useDayStore(state => state.viewMode);
  const setViewMode = useDayStore(state => state.setViewMode);
  const showCards = viewMode === 'cards' && !isEmpty;
  const removeItem = useDayStore(state => state.removeItem);
  const moveItem = useDayStore(state => state.moveItem);
  const markDone = useDayStore(state => state.markDone);
  const setItemTime = useDayStore(state => state.setItemTime);
  const { showDialog } = useDialog();

  const [reordering, setReordering] = useState(false);
  const [timeEditId, setTimeEditId] = useState<string | null>(null);
  const timeEditItem = items.find(it => it.id === timeEditId);
  const swipeRefs = useRef<Map<string, Swipeable>>(new Map());
  const openRowId = useRef<string | null>(null);

  const today = new Date();
  const dateLabel = `${DAYS[today.getDay()].toUpperCase()} · ${today.getDate()} ${MONTHS[today.getMonth()].toUpperCase()}`;

  function closeRow(id: string | null) {
    if (id) swipeRefs.current.get(id)?.close();
  }

  function handleRowOpen(id: string) {
    if (openRowId.current && openRowId.current !== id) closeRow(openRowId.current);
    openRowId.current = id;
  }

  function confirmDelete(it: DayItem) {
    closeRow(it.id);
    showDialog({
      title: 'Quitar de mi día',
      message: `¿Quitar "${it.label}" de la rutina de hoy?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            removeItem(it.id);
          },
        },
      ],
    });
  }

  function startReorder(id?: string) {
    setViewMode('list');
    closeRow(id ?? openRowId.current);
    openRowId.current = null;
    setReordering(true);
  }

  function handleMove(id: string, dir: -1 | 1) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    moveItem(id, dir);
  }


  function renderRightActions(it: DayItem, progress: Animated.AnimatedInterpolation<number>) {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [ACTION_W * 2, 0],
    });
    return (
      <Animated.View style={[s.actions, { transform: [{ translateX }] }]}>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: ACCENT }]} onPress={() => startReorder(it.id)}>
          <MaterialCommunityIcons name="swap-vertical" size={22} color="#fff" />
          <Text style={s.actionText}>Ordenar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: DANGER }]} onPress={() => confirmDelete(it)}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#fff" />
          <Text style={s.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.dateLabel}>{dateLabel}</Text>
          <Text style={s.title}>{reordering ? 'Ordenar' : 'Mi día'}</Text>
        </View>
        {reordering ? (
          <TouchableOpacity style={s.doneBtn} onPress={() => setReordering(false)}>
            <MaterialCommunityIcons name="check" size={18} color="#fff" />
            <Text style={s.doneBtnText}>Listo</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.viewToggle}>
            {([
              { mode: 'list', icon: 'format-list-bulleted', a11y: 'Vista lista' },
              { mode: 'cards', icon: 'view-agenda-outline', a11y: 'Vista tarjetas' },
            ] as const).map(opt => {
              const active = viewMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[s.toggleBtn, active && s.toggleBtnActive]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    closeRow(openRowId.current);
                    setViewMode(opt.mode);
                  }}
                  accessibilityLabel={opt.a11y}
                  accessibilityState={{ selected: active }}
                >
                  <MaterialCommunityIcons name={opt.icon} size={20} color={active ? '#fff' : INK} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Progreso */}
      {!isEmpty && (
      <View style={s.progressRow}>
        {items.map(it => (
          <View key={it.id} style={[
            s.progressChip,
            it.state === 'done'  ? { backgroundColor: INK } :
            it.state === 'now'   ? { backgroundColor: ACCENT } :
            { backgroundColor: 'rgba(0,0,0,0.10)' },
          ]} />
        ))}
      </View>
      )}

      {reordering && (
        <Text style={s.hint}>Usa las flechas para cambiar el orden. Las horas se ajustan solas.</Text>
      )}

      {/* Tarjetas */}
      {showCards && (
        <DayCardsView
          items={items}
          onPressItem={it => navigation.navigate('AddActivity', { dayItemId: it.id })}
          onPressTime={it => setTimeEditId(it.id)}
          onMarkDone={it => markDone(it.id)}
        />
      )}

      {/* Timeline */}
      {!showCards && (
      <ScrollView
        style={s.timeline}
        contentContainerStyle={[s.timelineContent, isEmpty && s.timelineEmpty]}
      >
        {items.length > 0 && <View style={s.vertLine} />}

        {items.length === 0 && loading && (
          <View style={s.empty}>
            <ActivityIndicator color={ACCENT} />
          </View>
        )}

        {items.length === 0 && !loading && (
          <EmptyDayState
            onAdd={() => navigation.navigate('ActivityCatalog')}
            onQuickPick={catalogItemId => navigation.navigate('AddActivity', { catalogItemId })}
          />
        )}

        {items.map((it, index) => {
          const done = it.state === 'done';
          const now  = it.state === 'now';
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          const card = (
            <TouchableOpacity
              activeOpacity={reordering ? 1 : 0.85}
              disabled={reordering}
              onPress={() => {
                closeRow(openRowId.current);
                navigation.navigate('AddActivity', { dayItemId: it.id });
              }}
              accessibilityHint="Toca para editar"
              style={[
                s.card,
                now  && { borderColor: ACCENT, borderWidth: 2.5 },
                done && !reordering && { opacity: 0.55 },
              ]}
            >
              <View style={[s.catStrip, { backgroundColor: it.color.stroke }]} />
              <View style={s.cardInner}>
                <PictoIcon kind={it.iconKey} imageUri={it.imageUri} color={it.color} size={48} hideLabel />
                <View style={s.cardText}>
                  <View style={s.timeRow}>
                    <TouchableOpacity
                      style={s.timeChip}
                      disabled={reordering}
                      onPress={() => {
                        closeRow(openRowId.current);
                        setTimeEditId(it.id);
                      }}
                      hitSlop={8}
                      accessibilityLabel={`Cambiar hora de ${it.label}`}
                    >
                      <MaterialCommunityIcons name="clock-edit-outline" size={14} color={ACCENT} />
                      <Text style={s.timeText}>{formatShortTime(it.time)}</Text>
                    </TouchableOpacity>
                    <View style={[s.badge, { backgroundColor: it.color.bg }]}>
                      <Text style={[s.badgeText, { color: it.color.stroke }]} numberOfLines={1}>{it.categoryLabel}</Text>
                    </View>
                  </View>
                  <Text style={[s.actName, done && { textDecorationLine: 'line-through' }]} numberOfLines={2}>{it.label}</Text>
                  {it.sub ? <Text style={s.subText}>{it.sub}</Text> : null}
                </View>

                {reordering ? (
                  <View style={s.moveCol}>
                    <TouchableOpacity
                      style={[s.moveBtn, isFirst && s.moveBtnDisabled]}
                      disabled={isFirst}
                      onPress={() => handleMove(it.id, -1)}
                      hitSlop={6}
                    >
                      <MaterialCommunityIcons name="chevron-up" size={22} color={isFirst ? INK3 : INK} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.moveBtn, isLast && s.moveBtnDisabled]}
                      disabled={isLast}
                      onPress={() => handleMove(it.id, 1)}
                      hitSlop={6}
                    >
                      <MaterialCommunityIcons name="chevron-down" size={22} color={isLast ? INK3 : INK} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {now && (
                      <TouchableOpacity style={s.ahoraBtn} onPress={() => markDone(it.id)}>
                        <Text style={s.ahoraBtnText}>AHORA</Text>
                      </TouchableOpacity>
                    )}
                    {done && <Text style={s.checkText}>✓</Text>}
                  </>
                )}
              </View>
            </TouchableOpacity>
          );

          return (
            <View key={it.id} style={s.row}>
              <View style={s.bulletCol}>
                <View style={
                  done ? { width: 14, height: 14, borderRadius: 7, backgroundColor: INK, borderColor: INK, borderWidth: 3 } :
                  now  ? { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderColor: ACCENT, borderWidth: 4 } :
                  { width: 14, height: 14, borderRadius: 7, backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.18)', borderWidth: 3 }
                } />
              </View>

              <View style={s.cardWrap}>
                <Swipeable
                  ref={ref => {
                    if (ref) swipeRefs.current.set(it.id, ref);
                    else swipeRefs.current.delete(it.id);
                  }}
                  enabled={!reordering}
                  friction={2}
                  rightThreshold={40}
                  overshootRight={false}
                  renderRightActions={progress => renderRightActions(it, progress)}
                  onSwipeableWillOpen={() => handleRowOpen(it.id)}
                  containerStyle={s.swipeContainer}
                >
                  {card}
                </Swipeable>
              </View>
            </View>
          );
        })}
      </ScrollView>
      )}

      <TimeEditModal
        visible={!!timeEditItem}
        activity={timeEditItem}
        onClose={() => setTimeEditId(null)}
        onSave={time => {
          if (timeEditId) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setItemTime(timeEditId, time);
          }
          setTimeEditId(null);
        }}
      />

      {/* FAB */}
      {!reordering && !isEmpty && (
        <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('ActivityCatalog')}>
          <Text style={s.fabPlus}>＋</Text>
          <Text style={s.fabText}>Actividad</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const BULLET_COL = 36;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10,
  },
  dateLabel: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '800', letterSpacing: 0.5 },
  title: { fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', color: INK },
  viewToggle: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 3,
    borderWidth: 1.5, borderColor: BORDER,
  },
  toggleBtn: { width: 40, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: INK },
  doneBtn: {
    height: 40, paddingHorizontal: 14, borderRadius: 10, backgroundColor: ACCENT,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  doneBtnText: { fontFamily: FONT_DISP, fontSize: 14, fontWeight: '800', color: '#fff' },

  progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingBottom: 10 },
  progressChip: { flex: 1, height: 5, borderRadius: 2 },

  hint: {
    fontFamily: FONT_BODY, fontSize: 12, fontWeight: '600', color: INK2,
    paddingHorizontal: 16, paddingBottom: 8,
  },

  timeline: { flex: 1 },
  timelineContent: { paddingHorizontal: 14, paddingBottom: 80, paddingTop: 6 },

  vertLine: {
    position: 'absolute',
    left: 14 + BULLET_COL / 2 - 1,
    top: 14, bottom: 14, width: 3,
    backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 2,
  },

  timelineEmpty: { flexGrow: 1, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bulletCol: { width: BULLET_COL, alignItems: 'center', justifyContent: 'center', zIndex: 2 },

  cardWrap: { flex: 1 },
  swipeContainer: { borderRadius: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1.5, borderColor: BORDER,
    overflow: 'hidden', flexDirection: 'row',
  },
  catStrip: { width: 6, flexShrink: 0 },
  cardInner: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingVertical: 8, paddingHorizontal: 10,
  },
  cardText: { flex: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EAF1F7', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  timeText: { fontFamily: FONT_DISP, fontSize: 14, fontWeight: '800', color: ACCENT },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, flexShrink: 1 },
  badgeText: { fontFamily: FONT_BODY, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  actName: { fontFamily: FONT_DISP, fontSize: 17, fontWeight: '800', color: INK },
  subText: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '600', marginTop: 2 },

  ahoraBtn: { backgroundColor: ACCENT, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  ahoraBtnText: { fontFamily: FONT_DISP, fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  checkText: { fontSize: 18, color: INK, fontWeight: '800', paddingRight: 4 },

  moveCol: { gap: 4 },
  moveBtn: {
    width: 36, height: 30, borderRadius: 8,
    backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  moveBtnDisabled: { opacity: 0.4 },

  actions: { flexDirection: 'row', marginLeft: 8 },
  actionBtn: {
    width: ACTION_W, marginLeft: 6, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  actionText: { fontFamily: FONT_DISP, fontSize: 12, fontWeight: '800', color: '#fff' },

  fab: {
    position: 'absolute', bottom: 16, right: 16,
    height: 50, paddingHorizontal: 18, borderRadius: 25,
    backgroundColor: INK, flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  fabPlus: { fontSize: 20, color: '#fff', lineHeight: 22 },
  fabText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 14, color: '#fff' },
});
