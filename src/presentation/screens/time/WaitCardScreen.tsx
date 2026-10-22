import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated, Vibration, Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TimeScreenProps } from '../../navigation/types';
import WaitingChild from '../../components/time/WaitingChild';
import DayItemPickerSheet from '../../components/time/DayItemPickerSheet';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { useDayStore } from '../../stores/useDayStore';
import { T, TILE, ToolTopBar, getNowAndNext } from './timeShared';

type Props = TimeScreenProps<'WaitCard'>;

type Phase = 'ready' | 'waiting' | 'done';

// null = "hasta que me digan" (sin tiempo)
const DURATIONS: { label: string; minutes: number | null }[] = [
  { label: 'SIN', minutes: null },
  { label: '2 min', minutes: 2 },
  { label: '3 min', minutes: 3 },
  { label: '5 min', minutes: 5 },
];
const DOTS = 5;

export default function WaitCardScreen({ navigation }: Props) {
  const items = useDayStore(s => s.items);
  const { next } = getNowAndNext(items);
  const pending = items.filter(it => it.state !== 'done');

  // Lo que se espera (por defecto, lo siguiente de Mi día). '' = nada.
  const [forId, setForId] = useState<string | null>(null);
  const waitingFor = forId === null ? next : forId === '' ? undefined : items.find(it => it.id === forId);
  const [picking, setPicking] = useState(false);

  const [minutes, setMinutes] = useState<number | null>(2);
  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const totalSec = minutes ? minutes * 60 : 0;

  // Conteo
  useEffect(() => {
    if (phase !== 'waiting') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'waiting' && totalSec > 0 && elapsed >= totalSec) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, totalSec, phase]);

  // Celebración
  const pop = useRef(new Animated.Value(0)).current;
  function finish() {
    setPhase('done');
    Vibration.vibrate([0, 250, 120, 250]);
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
  }

  function startWaiting() {
    setElapsed(0);
    setPhase('waiting');
  }

  function restart() {
    setElapsed(0);
    setPhase('ready');
  }

  // Puntos que se van llenando (cuenta visual)
  const filled = totalSec > 0 ? Math.min(DOTS, Math.floor((elapsed / totalSec) * DOTS)) : 0;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const done = phase === 'done';

  return (
    <SafeAreaView style={s.safe}>
      <ToolTopBar title="Esperar" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Tarjeta de espera */}
        <View style={[s.card, done && s.cardDone]}>
          {done ? (
            <Animated.View style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
              <WaitingChild size={200} happy />
            </Animated.View>
          ) : (
            <WaitingChild size={200} animate />
          )}

          <Text style={s.big}>{done ? '¡MUY BIEN!' : 'ESPERO'}</Text>
          <Text style={s.caption}>
            {done ? 'Esperaste tranquilo.' : 'Me siento y espero tranquilo.'}
          </Text>

          {/* Cuenta visual */}
          {minutes !== null && phase !== 'ready' && (
            <View style={s.dotsRow}>
              {Array.from({ length: DOTS }).map((_, i) => {
                const isFilled = i < filled || done;
                const isCurrent = !done && i === filled;
                return (
                  <Animated.View
                    key={i}
                    style={[
                      s.dot,
                      isFilled && s.dotFilled,
                      isCurrent && {
                        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
                      },
                    ]}
                  >
                    {isFilled && <MaterialCommunityIcons name="star" size={20} color="#FFE66B" />}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>

        {/* Qué espero */}
        <Text style={s.label}>{done ? 'AHORA TOCA' : 'ESPERO PARA...'}</Text>
        <TouchableOpacity style={s.forCard} activeOpacity={0.85} onPress={() => setPicking(true)} disabled={phase === 'waiting'}>
          {waitingFor ? (
            <PictoIcon kind={waitingFor.iconKey} imageUri={waitingFor.imageUri} color={waitingFor.color} size={done ? 72 : 56} hideLabel />
          ) : (
            <View style={[s.forEmpty, { backgroundColor: TILE.blue.bg, borderColor: TILE.blue.stroke }]}>
              <MaterialCommunityIcons name="help" size={26} color={TILE.blue.stroke} />
            </View>
          )}
          <View style={s.forInfo}>
            <Text style={[s.forTitle, done && s.forTitleBig]} numberOfLines={2}>
              {waitingFor ? waitingFor.label : 'Algo que me gusta'}
            </Text>
            {!done && <Text style={s.forSub}>Cuando termine de esperar</Text>}
          </View>
          {phase === 'ready' && <Text style={s.change}>Cambiar</Text>}
        </TouchableOpacity>

        {/* Cuánto */}
        {phase === 'ready' && (
          <>
            <Text style={s.label}>¿CUÁNTO TIEMPO?</Text>
            <View style={s.durRow}>
              {DURATIONS.map(d => {
                const active = minutes === d.minutes;
                return (
                  <TouchableOpacity
                    key={d.label}
                    style={[s.durBtn, active && s.durBtnActive]}
                    onPress={() => setMinutes(d.minutes)}
                  >
                    <Text style={[s.durText, active && s.durTextActive]}>{d.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Acción */}
      <View style={s.footer}>
        {phase === 'ready' && (
          <TouchableOpacity style={s.mainBtn} onPress={startWaiting} activeOpacity={0.85}>
            <MaterialCommunityIcons name="play" size={24} color="#fff" />
            <Text style={s.mainText}>Empezar a esperar</Text>
          </TouchableOpacity>
        )}
        {phase === 'waiting' && (
          <TouchableOpacity style={s.mainBtn} onPress={finish} activeOpacity={0.85}>
            <MaterialCommunityIcons name="check" size={24} color="#fff" />
            <Text style={s.mainText}>Ya terminó la espera</Text>
          </TouchableOpacity>
        )}
        {done && (
          <View style={s.doneRow}>
            <TouchableOpacity style={s.secondaryBtn} onPress={restart}>
              <MaterialCommunityIcons name="restart" size={22} color={T.INK} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.mainBtn, s.flex]} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Text style={s.mainText}>Listo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <DayItemPickerSheet
        visible={picking}
        title="Espero para..."
        items={pending}
        selectedId={waitingFor?.id ?? null}
        allowNone
        onClose={() => setPicking(false)}
        onSelect={it => {
          setForId(it ? it.id : '');
          setPicking(false);
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
  flex: { flex: 1 },

  card: {
    alignItems: 'center', backgroundColor: TILE.blue.bg,
    borderRadius: 28, borderWidth: 3, borderColor: TILE.blue.stroke,
    paddingTop: 18, paddingBottom: 22, paddingHorizontal: 16,
  },
  cardDone: { backgroundColor: TILE.green.bg, borderColor: TILE.green.stroke },
  big: { fontFamily: T.FONT_DISP, fontSize: 40, fontWeight: '800', color: T.INK, letterSpacing: 2, marginTop: 6 },
  caption: { fontFamily: T.FONT_BODY, fontSize: 15, fontWeight: '700', color: T.INK, opacity: 0.8, marginTop: 2 },

  dotsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  dot: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: T.INK,
    backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  dotFilled: { backgroundColor: T.INK },

  label: {
    fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.7,
    color: T.INK3, marginTop: 20, marginBottom: 8,
  },
  forCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.CARD, borderRadius: 16, padding: 12,
  },
  forEmpty: { width: 56, height: 56, borderRadius: 12, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  forInfo: { flex: 1 },
  forTitle: { fontFamily: T.FONT_DISP, fontSize: 18, fontWeight: '800', color: T.INK },
  forTitleBig: { fontSize: 24 },
  forSub: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '600', color: T.INK3, marginTop: 2 },
  change: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', color: T.ACCENT },

  durRow: { flexDirection: 'row', gap: 8 },
  durBtn: {
    flex: 1, height: 50, borderRadius: 12, backgroundColor: T.CARD,
    borderWidth: 1.5, borderColor: T.BORDER, alignItems: 'center', justifyContent: 'center',
  },
  durBtnActive: { backgroundColor: T.INK, borderColor: T.INK },
  durText: { fontFamily: T.FONT_DISP, fontSize: 14, fontWeight: '800', color: T.INK },
  durTextActive: { color: '#fff' },

  footer: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 6 },
  doneRow: { flexDirection: 'row', gap: 10 },
  mainBtn: {
    height: 60, borderRadius: 16, backgroundColor: T.INK,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  mainText: { fontFamily: T.FONT_DISP, fontSize: 18, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    width: 60, height: 60, borderRadius: 16, backgroundColor: T.CARD,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.BORDER,
  },
});
