import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Animated, StatusBar, Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StoriesScreenProps } from '../../navigation/types';
import PictoIcon, { iconNameFor } from '../../components/pictograms/PictoIcon';
import { useStoriesStore } from '../../stores/useStoriesStore';
import { KIND_META, supportColor } from '../../utils/storyKinds';
import { speech } from '../../../infrastructure/speech/speech';
import { playStep, stopVoice, sayText } from '../../utils/stepVoice';
import { T } from '../time/timeShared';

type Props = StoriesScreenProps<'StoryReader'>;

const DARK = '#0B0B0D';
const DARK_BTN = '#1E1E22';
const MEDIA_H = Math.min(Dimensions.get('window').width - 32, Dimensions.get('window').height * 0.38);

/** Lector en modo niño: fondo negro, texto grande, sin distracciones. */
export default function StoryReaderScreen({ navigation, route }: Props) {
  const story = useStoriesStore(s => s.stories.find(st => st.id === route.params.storyId));
  const [index, setIndex] = useState(0);
  const [autoRead, setAutoRead] = useState(true);
  const [finished, setFinished] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;

  const steps = story?.steps ?? [];
  const step = steps[index];
  const total = steps.length;

  // Grabación de la familia si existe; si no, voz del teléfono.
  const say = useCallback((st?: { text: string; audioUrl?: string }) => {
    if (st) playStep(st).catch(() => undefined);
  }, []);

  // Lee el paso al llegar a él (si la lectura automática está activa).
  useEffect(() => {
    if (autoRead && step && !finished) say(step);
  }, [index, autoRead, finished, step, say]);

  useEffect(() => () => stopVoice(), []);

  function goTo(next: number) {
    if (next < 0) return;
    if (next >= total) {
      stopVoice();
      setFinished(true);
      sayText('¡Terminaste!');
      return;
    }
    Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setIndex(next);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }

  if (!story || total === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" />
        <View style={s.center}>
          <Text style={s.text}>Esta historia aún no tiene pasos.</Text>
          <TouchableOpacity style={s.pill} onPress={() => navigation.goBack()}>
            <Text style={s.pillText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const meta = KIND_META[step?.kind ?? 'lugar'];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Barra superior */}
      <View style={s.top}>
        <TouchableOpacity style={s.topBtn} onPress={() => navigation.goBack()} accessibilityLabel="Cerrar">
          <MaterialCommunityIcons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.topTitle} numberOfLines={1}>
          {story.title} · {finished ? total : index + 1} / {total}
        </Text>
        <TouchableOpacity
          style={s.topBtn}
          onPress={() => {
            if (autoRead) stopVoice();
            setAutoRead(v => !v);
          }}
          accessibilityLabel={autoRead ? 'Pausar lectura automática' : 'Activar lectura automática'}
        >
          <MaterialCommunityIcons name={autoRead ? 'pause' : 'play'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progreso */}
      <View style={s.progress}>
        {steps.map((st, i) => (
          <View key={st.id} style={[s.seg, (i <= index || finished) && s.segOn]} />
        ))}
      </View>

      {finished ? (
        <View style={s.center}>
          <View style={s.doneBadge}>
            <MaterialCommunityIcons name="star" size={72} color="#FFE66B" />
          </View>
          <Text style={s.doneTitle}>¡Terminaste!</Text>
          <Text style={s.doneSub}>{story.title}</Text>
        </View>
      ) : (
        <Animated.View style={[s.stage, { opacity: fade }]}>
          {/* Tarjeta del paso */}
          <TouchableOpacity activeOpacity={0.95} onPress={() => say(step)} style={s.card}>
            <View style={s.cardHead}>
              <Text style={s.cardHeadText}>{meta.label}</Text>
            </View>
            <View style={[s.media, { backgroundColor: meta.bg }]}>
              {step.mediaUrl ? (
                <Image source={{ uri: step.mediaUrl }} style={s.image} resizeMode="cover" />
              ) : (
                <MaterialCommunityIcons name={iconNameFor(step.pictogramKey)} size={MEDIA_H * 0.55} color={meta.stroke} />
              )}
            </View>
          </TouchableOpacity>

          <Text style={s.text}>{step.text}</Text>

          {step.supportPictograms.length > 0 && (
            <View style={s.support}>
              {step.supportPictograms.map((k, i) => (
                <PictoIcon key={`${k}-${i}`} kind={k} color={supportColor(k)} size={46} hideLabel />
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {/* Controles */}
      <View style={s.controls}>
        {finished ? (
          <>
            <TouchableOpacity
              style={[s.pill, s.flex]}
              onPress={() => {
                setFinished(false);
                setIndex(0);
              }}
            >
              <MaterialCommunityIcons name="restart" size={22} color={DARK} />
              <Text style={s.pillText}>Otra vez</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.pill, s.flex]} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="check" size={22} color={DARK} />
              <Text style={s.pillText}>Salir</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[s.square, index === 0 && s.disabled]}
              onPress={() => goTo(index - 1)}
              disabled={index === 0}
              accessibilityLabel="Anterior"
            >
              <MaterialCommunityIcons name="arrow-left" size={28} color={DARK} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.pill, s.flex]} onPress={() => say(step)}>
              <MaterialCommunityIcons name="play" size={22} color={DARK} />
              <Text style={s.pillText}>Tocar para oír</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.square} onPress={() => goTo(index + 1)} accessibilityLabel="Siguiente">
              <MaterialCommunityIcons name="arrow-right" size={28} color={DARK} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },

  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  topBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: DARK_BTN, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: T.FONT_BODY, fontSize: 14, fontWeight: '800', color: '#fff' },

  progress: { flexDirection: 'row', gap: 5, paddingHorizontal: 16, marginBottom: 16 },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)' },
  segOn: { backgroundColor: '#fff' },

  stage: { flex: 1, paddingHorizontal: 16, alignItems: 'center' },
  card: {
    width: '100%', borderRadius: 22, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: '#fff',
  },
  cardHead: { backgroundColor: '#17151C', paddingHorizontal: 14, paddingVertical: 8 },
  cardHeadText: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, color: '#fff' },
  media: { height: MEDIA_H, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },

  text: {
    fontFamily: T.FONT_DISP, fontSize: 28, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginTop: 22, lineHeight: 34,
  },
  support: { flexDirection: 'row', gap: 12, marginTop: 16 },

  doneBadge: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: DARK_BTN,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFE66B',
  },
  doneTitle: { fontFamily: T.FONT_DISP, fontSize: 36, fontWeight: '800', color: '#fff' },
  doneSub: { fontFamily: T.FONT_BODY, fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },

  controls: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10 },
  square: { width: 62, height: 62, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.35 },
  pill: {
    height: 62, borderRadius: 16, backgroundColor: '#fff', paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  pillText: { fontFamily: T.FONT_DISP, fontSize: 18, fontWeight: '800', color: DARK },
});
