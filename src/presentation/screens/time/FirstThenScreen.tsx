import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TimeScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import DayItemPickerSheet from '../../components/time/DayItemPickerSheet';
import { useDayStore, DayItem } from '../../stores/useDayStore';
import { T, TILE, ToolTopBar, getNowAndNext, toMin, fmtDuration } from './timeShared';
import { themedStyles } from '../../theme/tokens';

type Props = TimeScreenProps<'FirstThen'>;

interface Slot {
  id?: string;
  label: string;
  iconKey: string;
  imageUri?: string;
  color: { bg: string; stroke: string };
  minutes: number;
}

// Tablero de ejemplo cuando Mi día aún no tiene actividades.
const DEMO_FIRST: Slot = { label: 'Cepillarse los dientes', iconKey: 'lavar', color: TILE.green, minutes: 3 };
const DEMO_THEN: Slot = { label: 'Jugar con bloques', iconKey: 'jugar', color: TILE.blue, minutes: 15 };

function toSlot(it: DayItem, following?: DayItem): Slot {
  const minutes = following ? Math.max(1, toMin(following.time) - toMin(it.time)) : 15;
  return { id: it.id, label: it.label, iconKey: it.iconKey, imageUri: it.imageUri, color: it.color, minutes };
}

export default function FirstThenScreen({ navigation }: Props) {
  const items = useDayStore(s => s.items);
  const markDone = useDayStore(s => s.markDone);
  const pending = items.filter(it => it.state !== 'done');

  const { now, next } = getNowAndNext(items);
  const [firstId, setFirstId] = useState<string | undefined>(now?.id);
  const [thenId, setThenId] = useState<string | undefined>(next?.id);
  const [firstDone, setFirstDone] = useState(false);
  const [picker, setPicker] = useState<null | 'first' | 'then'>(null);

  const { first, then } = useMemo(() => {
    const byId = (id?: string) => items.find(it => it.id === id);
    const followOf = (it?: DayItem) => (it ? items[items.findIndex(x => x.id === it.id) + 1] : undefined);
    const f = byId(firstId);
    const t = byId(thenId);
    return {
      first: f ? toSlot(f, followOf(f)) : DEMO_FIRST,
      then: t ? toSlot(t, followOf(t)) : DEMO_THEN,
    };
  }, [items, firstId, thenId]);

  function onFinished() {
    if (!firstDone) {
      setFirstDone(true);
      if (first.id) markDone(first.id);
      return;
    }
    // "Siguiente": lo de después pasa a ser lo primero.
    const idx = pending.findIndex(it => it.id === then.id);
    setFirstId(then.id);
    setThenId(idx >= 0 ? pending[idx + 1]?.id : undefined);
    setFirstDone(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ToolTopBar
        title="Primero / Después"
        onBack={() => navigation.goBack()}
        rightIcon="pencil-outline"
        onRight={() => setPicker('first')}
      />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* 1 · PRIMERO */}
        <View style={s.board}>
          <View style={s.boardHead}>
            <Text style={s.boardHeadText}>1 · PRIMERO</Text>
          </View>
          <View style={s.boardBody}>
            <View>
              <PictoIcon kind={first.iconKey} imageUri={first.imageUri} color={first.color} size={96} hideLabel />
              {firstDone && (
                <View style={s.doneOverlay}>
                  <MaterialCommunityIcons name="check-bold" size={48} color="#fff" />
                </View>
              )}
            </View>
            <View style={s.boardInfo}>
              <Text style={[s.boardTitle, firstDone && s.titleDone]} numberOfLines={3}>{first.label}</Text>
              <Text style={s.boardSub}>{fmtDuration(first.minutes).replace('min', 'minutos')}</Text>
              {!firstDone && (
                <TouchableOpacity
                  style={s.startBtn}
                  onPress={() => navigation.navigate('VisualTimer', { minutes: Math.min(60, first.minutes) })}
                >
                  <Text style={s.startText}>Empezar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Flecha */}
        <View style={s.arrowRow}>
          <View style={s.arrowLine} />
          <MaterialCommunityIcons name="arrow-right" size={22} color={T.INK} />
          <View style={s.arrowLine} />
        </View>

        {/* 2 · DESPUÉS */}
        <View style={[s.board, firstDone && s.boardHighlight]}>
          <View style={[s.boardHead, s.boardHeadThen]}>
            <Text style={s.boardHeadText}>2 · DESPUÉS</Text>
          </View>
          <View style={s.boardBody}>
            <PictoIcon kind={then.iconKey} imageUri={then.imageUri} color={then.color} size={96} hideLabel />
            <View style={s.boardInfo}>
              <Text style={s.boardTitleLg} numberOfLines={3}>{then.label}</Text>
              <Text style={s.boardSub}>{fmtDuration(then.minutes).replace('min', 'minutos')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Mensaje */}
      <View style={[s.banner, firstDone && s.bannerDone]}>
        <MaterialCommunityIcons
          name={firstDone ? 'emoticon-happy-outline' : 'emoticon-neutral-outline'}
          size={22}
          color={T.ON_PASTEL}
        />
        <Text style={s.bannerText}>
          {firstDone
            ? `¡Muy bien! Ahora toca: ${then.label.toLowerCase()}.`
            : 'Si terminas lo primero, te ganas lo de después.'}
        </Text>
      </View>

      {/* Acciones */}
      <View style={s.footer}>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => setPicker('first')}>
          <Text style={s.secondaryText}>Cambiar tablero</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.primaryBtn} onPress={onFinished} activeOpacity={0.85}>
          <MaterialCommunityIcons name={firstDone ? 'arrow-right' : 'check'} size={20} color="#fff" />
          <Text style={s.primaryText}>{firstDone ? 'Siguiente' : 'Terminado'}</Text>
        </TouchableOpacity>
      </View>

      <DayItemPickerSheet
        visible={picker !== null}
        title={picker === 'then' ? '2 · ¿Qué viene después?' : '1 · ¿Qué va primero?'}
        items={pending}
        selectedId={picker === 'then' ? then.id : first.id}
        onClose={() => setPicker(null)}
        onSelect={it => {
          if (picker === 'first') {
            setFirstId(it?.id);
            setFirstDone(false);
            setPicker('then');
          } else {
            setThenId(it?.id);
            setPicker(null);
          }
        }}
      />
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 16, paddingBottom: 16 },

  board: { backgroundColor: T.CARD, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  boardHighlight: { borderColor: T.ACCENT },
  boardHead: { backgroundColor: T.PRIMARY, paddingHorizontal: 14, paddingVertical: 9 },
  boardHeadThen: { backgroundColor: '#0F1B26' },
  boardHeadText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, color: '#fff' },
  boardBody: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  boardInfo: { flex: 1 },
  boardTitle: { fontFamily: T.FONT_DISP, fontSize: 22, fontWeight: '800', color: T.INK, lineHeight: 26 },
  boardTitleLg: { fontFamily: T.FONT_DISP, fontSize: 24, fontWeight: '800', color: T.INK, lineHeight: 28 },
  titleDone: { color: T.INK3, textDecorationLine: 'line-through' },
  boardSub: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '700', color: T.INK3, marginTop: 4 },
  startBtn: {
    alignSelf: 'flex-start', backgroundColor: T.ACCENT_FILL, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 10,
  },
  startText: { fontFamily: T.FONT_DISP, fontSize: 14, fontWeight: '800', color: '#fff' },
  doneOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 21,
    backgroundColor: 'rgba(35,27,46,0.6)', alignItems: 'center', justifyContent: 'center',
  },

  arrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  arrowLine: { width: 48, height: 2, backgroundColor: T.INK3, borderRadius: 1 },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 10,
    backgroundColor: T.INFO_BG, borderRadius: 12, borderWidth: 2, borderColor: '#0a1a2a',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  bannerDone: { backgroundColor: TILE.green.bg, borderColor: TILE.green.stroke },
  bannerText: { flex: 1, fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', color: T.ON_PASTEL },

  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14 },
  secondaryBtn: {
    height: 56, paddingHorizontal: 16, borderRadius: 14, backgroundColor: T.CARD,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.BORDER,
  },
  secondaryText: { fontFamily: T.FONT_DISP, fontSize: 15, fontWeight: '800', color: T.INK },
  primaryBtn: {
    flex: 1, height: 56, borderRadius: 14, backgroundColor: T.PRIMARY,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryText: { fontFamily: T.FONT_DISP, fontSize: 17, fontWeight: '800', color: '#fff' },
}));
