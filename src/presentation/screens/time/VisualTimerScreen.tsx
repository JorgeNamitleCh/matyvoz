import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TimeScreenProps } from '../../navigation/types';
import TimeTimerRing from '../../components/time/TimeTimerRing';
import DayItemPickerSheet from '../../components/time/DayItemPickerSheet';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { useTimerStore } from '../../stores/useTimerStore';
import { useDayStore } from '../../stores/useDayStore';
import { T, TILE, ToolTopBar, getNowAndNext } from './timeShared';
import { themedStyles } from '../../theme/tokens';

type Props = TimeScreenProps<'VisualTimer'>;

const PRESETS = [1, 3, 5, 10, 15];

export default function VisualTimerScreen({ navigation, route }: Props) {
  const {
    isRunning, secondsLeft, totalSeconds, nextDayItemId,
    setDuration, start, pause, resume, reset, finish, setNextDayItem,
  } = useTimerStore();
  const items = useDayStore(s => s.items);
  const [picking, setPicking] = useState(false);

  // Si se abrió con una duración (ej. "Empezar" en Primero/Después), arranca.
  const paramMinutes = route.params?.minutes;
  useEffect(() => {
    if (paramMinutes) start(paramMinutes * 60);
  }, [paramMinutes, start]);

  const totalMin = Math.round(totalSeconds / 60);
  const finished = secondsLeft === 0;
  const notStarted = !isRunning && secondsLeft === totalSeconds;
  const showSeconds = secondsLeft > 0 && secondsLeft < 60;
  const bigNumber = showSeconds ? secondsLeft : Math.ceil(secondsLeft / 60);
  const unit = showSeconds ? 'SEGUNDOS' : bigNumber === 1 ? 'MINUTO' : 'MINUTOS';

  // "Cuando termine…": la elegida, o por defecto la siguiente de Mi día.
  const { next } = getNowAndNext(items);
  const pending = items.filter(it => it.state !== 'done');
  // nextDayItemId: null = la siguiente de Mi día · '' = solo avisar · id = elegida
  const after =
    nextDayItemId === null ? next
      : nextDayItemId === '' ? undefined
        : items.find(it => it.id === nextDayItemId) ?? next;

  function onMain() {
    if (isRunning) pause();
    else if (finished || notStarted) start();
    else resume();
  }

  const mainLabel = isRunning ? 'Pausa' : finished ? 'Otra vez' : notStarted ? 'Empezar' : 'Seguir';
  const mainIcon = isRunning ? 'pause' : finished ? 'restart' : 'play';

  return (
    <SafeAreaView style={s.safe}>
      <ToolTopBar
        title="Temporizador"
        onBack={() => navigation.goBack()}
        rightIcon="dots-horizontal"
        onRight={() => setPicking(true)}
      />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.ringWrap}>
          <TimeTimerRing progress={totalSeconds > 0 ? secondsLeft / totalSeconds : 0} size={270} color={T.RED} ink={T.INK}>
            {finished ? (
              <View style={s.center}>
                <MaterialCommunityIcons name="check-bold" size={64} color={T.INK} />
                <Text style={s.unit}>¡TIEMPO!</Text>
              </View>
            ) : (
              <View style={s.center}>
                <Text style={s.bigNumber}>{bigNumber}</Text>
                <Text style={s.unit}>{unit}</Text>
                <Text style={s.of}>de {totalMin}</Text>
              </View>
            )}
          </TimeTimerRing>
        </View>

        <Text style={s.sectionLabel}>DURACIÓN</Text>
        <View style={s.presets}>
          {PRESETS.map(m => {
            const active = totalMin === m;
            return (
              <TouchableOpacity
                key={m}
                style={[s.preset, active && s.presetActive]}
                onPress={() => setDuration(m * 60)}
              >
                <Text style={[s.presetText, active && s.presetTextActive]}>{m}m</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[s.sectionLabel, s.leftLabel]}>CUANDO TERMINE...</Text>
        <TouchableOpacity style={s.afterCard} activeOpacity={0.85} onPress={() => setPicking(true)}>
          {after ? (
            <PictoIcon kind={after.iconKey} imageUri={after.imageUri} color={after.color} size={48} hideLabel />
          ) : (
            <View style={[s.afterEmpty, { backgroundColor: TILE.purple.bg, borderColor: TILE.purple.stroke }]}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={TILE.purple.stroke} />
            </View>
          )}
          <View style={s.afterInfo}>
            <Text style={s.afterTitle} numberOfLines={1}>
              {after ? `Luego: ${after.label}` : 'Solo avisar'}
            </Text>
            <Text style={s.afterSub}>Vibrará al terminar</Text>
          </View>
          <Text style={s.change}>Cambiar</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={s.controls}>
        <TouchableOpacity style={s.sideBtn} onPress={reset} accessibilityLabel="Reiniciar">
          <MaterialCommunityIcons name="restart" size={24} color={T.INK} />
        </TouchableOpacity>
        <TouchableOpacity style={s.mainBtn} onPress={onMain} activeOpacity={0.85}>
          <MaterialCommunityIcons name={mainIcon} size={24} color="#fff" />
          <Text style={s.mainText}>{mainLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.sideBtn} onPress={finish} accessibilityLabel="Terminar ya" disabled={finished}>
          <MaterialCommunityIcons name="skip-next" size={26} color={finished ? T.INK3 : T.INK} />
        </TouchableOpacity>
      </View>

      <DayItemPickerSheet
        visible={picking}
        title="Cuando termine..."
        items={pending}
        selectedId={after?.id ?? null}
        allowNone
        onClose={() => setPicking(false)}
        onSelect={it => {
          setNextDayItem(it ? it.id : '');
          setPicking(false);
        }}
      />
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: T.BG },
  content: { paddingHorizontal: 16, paddingBottom: 20 },

  ringWrap: { alignItems: 'center', marginTop: 4, marginBottom: 22 },
  center: { alignItems: 'center' },
  bigNumber: { fontFamily: T.FONT_DISP, fontSize: 76, fontWeight: '800', color: T.RED, lineHeight: 84 },
  unit: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', letterSpacing: 1, color: T.INK2 },
  of: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK3, marginTop: 2 },

  sectionLabel: {
    fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.7,
    color: T.INK3, textAlign: 'center', marginBottom: 10,
  },
  leftLabel: { textAlign: 'left', marginTop: 22 },

  presets: { flexDirection: 'row', gap: 8 },
  preset: {
    flex: 1, height: 48, borderRadius: 12, backgroundColor: T.CARD,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.BORDER,
  },
  presetActive: { backgroundColor: T.PRIMARY, borderColor: T.PRIMARY },
  presetText: { fontFamily: T.FONT_DISP, fontSize: 16, fontWeight: '800', color: T.INK },
  presetTextActive: { color: '#fff' },

  afterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: T.CARD, borderRadius: 14, padding: 12,
  },
  afterEmpty: { width: 48, height: 48, borderRadius: 11, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  afterInfo: { flex: 1 },
  afterTitle: { fontFamily: T.FONT_DISP, fontSize: 16, fontWeight: '800', color: T.INK },
  afterSub: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '600', color: T.INK3, marginTop: 2 },
  change: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', color: T.ACCENT },

  controls: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14, paddingTop: 6 },
  sideBtn: {
    width: 62, height: 62, borderRadius: 16, backgroundColor: T.CARD,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: T.BORDER,
  },
  mainBtn: {
    flex: 1, height: 62, borderRadius: 16, backgroundColor: T.PRIMARY,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  mainText: { fontFamily: T.FONT_DISP, fontSize: 19, fontWeight: '800', color: '#fff' },
}));
