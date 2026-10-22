import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TimeScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import TimeTimerRing from '../../components/time/TimeTimerRing';
import { useDayStore } from '../../stores/useDayStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { T, TILE, toMin, nowMin, getNowAndNext } from './timeShared';

type Props = TimeScreenProps<'TimeHub'>;

type When = 'ayer' | 'hoy' | 'manana';
const WHEN: { key: When; label: string; icon: string }[] = [
  { key: 'ayer',   label: 'Ayer',   icon: 'weather-night' },
  { key: 'hoy',    label: 'Hoy',    icon: 'white-balance-sunny' },
  { key: 'manana', label: 'Mañana', icon: 'weather-sunny' },
];

/** Minutos actuales, refrescados cada 30 s. */
function useClock() {
  const [m, setM] = useState(nowMin());
  useEffect(() => {
    const id = setInterval(() => setM(nowMin()), 30000);
    return () => clearInterval(id);
  }, []);
  return m;
}

export default function TimeHubScreen({ navigation }: Props) {
  const items = useDayStore(s => s.items);
  const { now, next } = getNowAndNext(items);
  const clock = useClock();
  const secondsLeft = useTimerStore(s => s.secondsLeft);
  const totalSeconds = useTimerStore(s => s.totalSeconds);
  const [when, setWhen] = useState<When>('hoy');

  // Tiempo que falta para la siguiente actividad
  const start = now ? toMin(now.time) : 0;
  const end = next ? toMin(next.time) : start + 60;
  const total = Math.max(1, end - start);
  const left = Math.max(0, end - clock);
  const elapsedPct = Math.min(1, Math.max(0, (clock - start) / total));
  const lh = Math.floor(left / 60);
  const lm = left % 60;

  const timerMin = Math.ceil(secondsLeft / 60);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.kicker}>HERRAMIENTAS</Text>
        <Text style={s.title}>Tiempo</Text>
        <Text style={s.subtitle}>Apoyos visuales para entender el tiempo, esperar y anticipar.</Text>

        {/* Ahora */}
        {now ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[s.nowCard, { backgroundColor: now.color.bg, borderColor: now.color.stroke }]}
            onPress={() => navigation.navigate('HowLong')}
          >
            <PictoIcon kind={now.iconKey} imageUri={now.imageUri} color={now.color} size={46} hideLabel />
            <View style={s.nowInfo}>
              <Text style={[s.nowKicker, { color: now.color.stroke }]} numberOfLines={1}>
                AHORA · {now.label.toUpperCase()}
              </Text>
              <Text style={[s.nowTitle, { color: now.color.stroke }]} numberOfLines={1}>
                {next ? `Hasta las ${next.time}` : 'Sigue en curso'}
              </Text>
              <View style={s.nowTrack}>
                <View style={[s.nowFill, { width: `${elapsedPct * 100}%`, backgroundColor: now.color.stroke }]} />
              </View>
            </View>
            <View style={s.nowLeft}>
              <Text style={[s.nowBig, { color: now.color.stroke }]}>{lh > 0 ? `${lh} h` : `${lm}`}</Text>
              <Text style={[s.nowSmall, { color: now.color.stroke }]}>{lh > 0 ? `${lm} min` : 'min'}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[s.nowCard, s.nowEmpty]}
            onPress={() => navigation.getParent()?.navigate('MiDía', { screen: 'Day' })}
          >
            <MaterialCommunityIcons name="calendar-blank-outline" size={30} color={T.INK3} />
            <View style={s.nowInfo}>
              <Text style={[s.nowKicker, { color: T.INK3 }]}>{next ? `A LAS ${next.time}` : 'AHORA'}</Text>
              <Text style={[s.nowTitle, { color: T.INK }]} numberOfLines={1}>
                {next ? `Lo siguiente: ${next.label}` : 'Sin actividad en curso'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={T.INK3} />
          </TouchableOpacity>
        )}

        {/* Temporizador visual */}
        <TouchableOpacity style={s.timerCard} activeOpacity={0.85} onPress={() => navigation.navigate('VisualTimer')}>
          <TimeTimerRing
            progress={totalSeconds > 0 ? secondsLeft / totalSeconds : 0}
            size={78}
            band={14}
            showTick={false}
            color={T.RED}
            ink={T.INK}
          >
            <Text style={s.miniRingText}>{timerMin}m</Text>
          </TimeTimerRing>
          <View style={s.timerInfo}>
            <Text style={s.toolTitleLg}>Temporizador visual</Text>
            <Text style={s.toolDesc}>Ver el tiempo pasar como un círculo que se vacía.</Text>
            <Text style={s.openLink}>ABRIR →</Text>
          </View>
        </TouchableOpacity>

        {/* Herramientas */}
        <View style={s.grid}>
          <ToolCard
            icon="arrow-right"
            color={TILE.green}
            title="Primero / Después"
            desc="Qué viene ahora y después"
            onPress={() => navigation.navigate('FirstThen')}
          />
          <ToolCard
            icon="help"
            color={TILE.orange}
            title="¿Cuánto falta?"
            desc="Para la próxima actividad"
            onPress={() => navigation.navigate('HowLong')}
          />
          <ToolCard
            icon="seat"
            color={TILE.blue}
            title="Esperar"
            desc="Tarjeta de espera"
            onPress={() => navigation.navigate('WaitCard')}
          />
        </View>

        {/* ¿Cuándo es? */}
        <View style={s.whenCard}>
          <Text style={s.whenLabel}>¿CUÁNDO ES?</Text>
          <View style={s.whenRow}>
            {WHEN.map(w => {
              const active = when === w.key;
              return (
                <TouchableOpacity
                  key={w.key}
                  style={[s.whenBtn, active && s.whenBtnActive]}
                  onPress={() => setWhen(w.key)}
                  accessibilityState={{ selected: active }}
                >
                  <MaterialCommunityIcons name={w.icon} size={20} color={active ? '#fff' : T.INK} />
                  <Text style={[s.whenText, active && s.whenTextActive]}>{w.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToolCard({
  icon, color, title, desc, onPress,
}: { icon: string; color: { bg: string; stroke: string }; title: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.toolCard} activeOpacity={0.85} onPress={onPress}>
      <View style={[s.toolTile, { backgroundColor: color.bg, borderColor: color.stroke }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color.stroke} />
      </View>
      <Text style={s.toolTitle}>{title}</Text>
      <Text style={s.toolDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },

  kicker: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: T.INK3 },
  title: { fontFamily: T.FONT_DISP, fontSize: 30, fontWeight: '800', color: T.INK, marginTop: 2 },
  subtitle: { fontFamily: T.FONT_BODY, fontSize: 13, color: T.INK3, marginTop: 4, marginBottom: 16 },

  nowCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 18, borderWidth: 3, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 12,
  },
  nowEmpty: { backgroundColor: T.CARD, borderColor: T.BORDER, borderWidth: 1.5 },
  nowInfo: { flex: 1 },
  nowKicker: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  nowTitle: { fontFamily: T.FONT_DISP, fontSize: 17, fontWeight: '800', marginTop: 1 },
  nowTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)', marginTop: 8, overflow: 'hidden' },
  nowFill: { height: '100%', borderRadius: 3 },
  nowLeft: { alignItems: 'flex-end' },
  nowBig: { fontFamily: T.FONT_DISP, fontSize: 18, fontWeight: '800' },
  nowSmall: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '800', marginTop: 2 },

  timerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: T.CARD, borderRadius: 18, padding: 14, marginBottom: 12,
  },
  miniRingText: { fontFamily: T.FONT_DISP, fontSize: 17, fontWeight: '800', color: T.INK },
  timerInfo: { flex: 1 },
  toolTitleLg: { fontFamily: T.FONT_DISP, fontSize: 18, fontWeight: '800', color: T.INK },
  openLink: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '800', color: T.ACCENT, marginTop: 6, letterSpacing: 0.4 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  toolCard: {
    width: '48.4%', backgroundColor: T.CARD, borderRadius: 18,
    paddingVertical: 16, paddingHorizontal: 14, minHeight: 116,
  },
  toolTile: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 10,
  },
  toolTitle: { fontFamily: T.FONT_DISP, fontSize: 15, fontWeight: '800', color: T.INK },
  toolDesc: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '600', color: T.INK3, marginTop: 3, lineHeight: 15 },

  whenCard: { backgroundColor: T.CARD, borderRadius: 18, padding: 14 },
  whenLabel: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: T.INK3, marginBottom: 10 },
  whenRow: { flexDirection: 'row', gap: 8 },
  whenBtn: {
    flex: 1, height: 64, borderRadius: 12, borderWidth: 1.5, borderColor: T.BORDER,
    backgroundColor: '#F7F6F3', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  whenBtnActive: { backgroundColor: T.INK, borderColor: T.INK },
  whenText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK },
  whenTextActive: { color: '#fff' },
});
