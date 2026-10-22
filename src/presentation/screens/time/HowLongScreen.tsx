import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TimeScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { useDayStore } from '../../stores/useDayStore';
import { T, ToolTopBar, getNowAndNext, toMin, nowMin, fmtDuration } from './timeShared';
import { SURFACE_ALT, LINE, themedStyles } from '../../theme/tokens';

type Props = TimeScreenProps<'HowLong'>;

const GRID_W = Dimensions.get('window').width - 32 - 28; // pantalla - márgenes - padding de la tarjeta
const GAP = 6;

function useClock() {
  const [m, setM] = useState(nowMin());
  useEffect(() => {
    const id = setInterval(() => setM(nowMin()), 30000);
    return () => clearInterval(id);
  }, []);
  return m;
}

export default function HowLongScreen({ navigation }: Props) {
  const items = useDayStore(s => s.items);
  const { now, next, later } = getNowAndNext(items);
  const clock = useClock();

  if (!now) {
    return (
      <SafeAreaView style={s.safe}>
        <ToolTopBar title="¿Cuánto falta?" onBack={() => navigation.goBack()} />
        <View style={s.empty}>
          <MaterialCommunityIcons name="calendar-clock" size={48} color={T.INK3} />
          <Text style={s.emptyTitle}>No hay actividad en curso</Text>
          <Text style={s.emptyText}>Añade actividades en Mi día para ver cuánto falta.</Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => navigation.getParent()?.navigate('MiDía', { screen: 'Day' })}
          >
            <Text style={s.emptyBtnText}>Ir a Mi día</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const start = toMin(now.time);
  const end = next ? toMin(next.time) : start + 60;
  const total = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(total, clock - start));
  const remaining = Math.max(0, end - Math.max(clock, start));
  const notYet = clock < start;

  // Cada cuadrado = 15 min (30/60 si el bloque es muy largo).
  const step = total > 360 ? 60 : total > 180 ? 30 : 15;
  const count = Math.ceil(total / step);
  const doneCount = Math.min(count, Math.floor(elapsed / step));
  const perRow = Math.min(count, 8);
  const size = Math.min(42, (GRID_W - GAP * (perRow - 1)) / perRow);

  return (
    <SafeAreaView style={s.safe}>
      <ToolTopBar title="¿Cuánto falta?" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Ahora */}
        <Text style={s.label}>AHORA</Text>
        <View style={s.nowCard}>
          <PictoIcon kind={now.iconKey} imageUri={now.imageUri} color={now.color} size={72} hideLabel />
          <View style={s.nowInfo}>
            <View style={[s.badge, { backgroundColor: now.color.bg }]}>
              <Text style={[s.badgeText, { color: now.color.stroke }]} numberOfLines={1}>{now.categoryLabel}</Text>
            </View>
            <Text style={s.nowTitle} numberOfLines={2}>{now.label}</Text>
            <Text style={s.nowSub}>
              {notYet ? `Empieza en ${fmtDuration(start - clock)}` : `Empezó hace ${fmtDuration(elapsed)}`}
            </Text>
          </View>
        </View>

        {/* Falta */}
        <View style={s.rowBetween}>
          <Text style={s.label}>FALTA...</Text>
          <Text style={s.labelStrong}>{remaining} MIN</Text>
        </View>
        <View style={s.card}>
          <View style={s.grid}>
            {Array.from({ length: count }).map((_, i) => {
              const done = i < doneCount;
              return (
                <View
                  key={i}
                  style={[s.square, { width: size, height: size }, done ? s.squareDone : s.squareLeft]}
                >
                  {done ? (
                    <MaterialCommunityIcons name="check" size={size * 0.45} color="#fff" />
                  ) : (
                    <Text style={s.squareText}>{step}</Text>
                  )}
                </View>
              );
            })}
          </View>
          <View style={s.rowBetween}>
            <Text style={s.edgeText}>{now.time} INICIO</Text>
            <Text style={s.edgeText}>{next ? `${next.time} SIGUIENTE` : 'FIN'}</Text>
          </View>
          <View style={s.hint}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={T.INK} />
            <Text style={s.hintText}>Cada cuadrado son {step} minutos</Text>
          </View>
        </View>

        {/* Luego */}
        {later.length > 0 && <Text style={[s.label, s.laterLabel]}>LUEGO...</Text>}
        {later.map(it => (
          <View key={it.id} style={s.laterRow}>
            <PictoIcon kind={it.iconKey} imageUri={it.imageUri} color={it.color} size={50} hideLabel />
            <View style={s.laterInfo}>
              <Text style={s.laterTitle} numberOfLines={1}>{it.time} · {it.label}</Text>
              <Text style={s.laterSub}>
                {toMin(it.time) > clock ? `En ${fmtDuration(toMin(it.time) - clock)}` : 'Pendiente'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 16, paddingBottom: 28 },

  label: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, color: T.INK3, marginBottom: 8 },
  labelStrong: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.4, color: T.INK, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  nowCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: T.CARD, borderRadius: 18, borderWidth: 2.5, borderColor: T.INK,
    padding: 14, marginBottom: 20,
  },
  nowInfo: { flex: 1 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, marginBottom: 4 },
  badgeText: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  nowTitle: { fontFamily: T.FONT_DISP, fontSize: 22, fontWeight: '800', color: T.INK },
  nowSub: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '700', color: T.INK3, marginTop: 2 },

  card: { backgroundColor: T.CARD, borderRadius: 18, padding: 14, gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  square: { borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  squareDone: { backgroundColor: T.PRIMARY, borderColor: T.PRIMARY },
  squareLeft: { backgroundColor: SURFACE_ALT, borderColor: LINE },
  squareText: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', color: T.INK3 },
  edgeText: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: T.INK2 },
  hint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: SURFACE_ALT, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  hintText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK },

  laterLabel: { marginTop: 22 },
  laterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.CARD, borderRadius: 16, padding: 12, marginBottom: 8,
  },
  laterInfo: { flex: 1 },
  laterTitle: { fontFamily: T.FONT_DISP, fontSize: 16, fontWeight: '800', color: T.INK },
  laterSub: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '600', color: T.INK3, marginTop: 2 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 10 },
  emptyTitle: { fontFamily: T.FONT_DISP, fontSize: 22, fontWeight: '800', color: T.INK, textAlign: 'center' },
  emptyText: { fontFamily: T.FONT_BODY, fontSize: 14, color: T.INK3, textAlign: 'center' },
  emptyBtn: { marginTop: 8, height: 50, paddingHorizontal: 24, borderRadius: 25, backgroundColor: T.PRIMARY, justifyContent: 'center' },
  emptyBtnText: { fontFamily: T.FONT_DISP, fontSize: 16, fontWeight: '800', color: '#fff' },
}));
