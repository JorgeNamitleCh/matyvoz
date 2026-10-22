import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { voiceRecorder } from '../../../infrastructure/audio/voiceRecorder';
import { sayText } from '../../utils/stepVoice';
import { INK, INK3, BORDER, BG, FONT_DISP, FONT_BODY } from '../../theme/tokens';

const RED = '#D0413F';
const GREEN = '#2E7D4F';
const MAX_MS = 30000;

type Phase = 'idle' | 'recording' | 'recorded';

interface Props {
  visible: boolean;
  /** Encabezado, ej. "GRABAR AUDIO · PASO 3" */
  title: string;
  text: string;
  /** Grabación actual del paso (si ya tiene) */
  audioUrl?: string;
  onSave: (uri: string | undefined) => void;
  onClose: () => void;
}

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Hoja para grabar la voz de la familia leyendo la frase de un paso. */
export default function RecordAudioSheet({ visible, title, text, audioUrl, onSave, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>(audioUrl ? 'recorded' : 'idle');
  const [uri, setUri] = useState<string | undefined>(audioUrl);
  const [ms, setMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;
  const available = voiceRecorder.available;

  // Al abrir, parte del audio que ya tenga el paso.
  useEffect(() => {
    if (visible) {
      setUri(audioUrl);
      setPhase(audioUrl ? 'recorded' : 'idle');
      setMs(0);
      setError(null);
    }
  }, [visible, audioUrl]);

  useEffect(() => {
    if (phase !== 'recording') return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    pulse.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  async function startRec() {
    setError(null);
    const ok = await voiceRecorder.start(t => {
      setMs(t);
      if (t >= MAX_MS) stopRec();
    });
    if (!ok) {
      setError('No se pudo usar el micrófono. Revisa el permiso en Ajustes.');
      return;
    }
    setMs(0);
    setPhase('recording');
  }

  async function stopRec() {
    const path = await voiceRecorder.stop();
    if (path) {
      setUri(path);
      setPhase('recorded');
    } else {
      setPhase('idle');
    }
  }

  async function playRec() {
    if (!uri) return;
    if (playing) {
      await voiceRecorder.stopPlayback();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const ok = await voiceRecorder.play(uri, () => setPlaying(false));
    if (!ok) {
      setPlaying(false);
      setError('Esta grabación no está en este teléfono. Grábala otra vez.');
    }
  }

  async function close() {
    if (phase === 'recording') await voiceRecorder.stop();
    await voiceRecorder.stopPlayback();
    setPlaying(false);
    onClose();
  }

  const ring = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={s.root}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={close} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.headRow}>
            <Text style={s.kicker}>{title}</Text>
            <TouchableOpacity style={s.close} onPress={close} accessibilityLabel="Cerrar">
              <MaterialCommunityIcons name="close" size={20} color={INK} />
            </TouchableOpacity>
          </View>

          <Text style={s.hint}>Lee en voz alta, con calma:</Text>
          <Text style={s.phrase}>{text.trim() ? `“${text.trim()}”` : 'Escribe primero el texto.'}</Text>

          {!available ? (
            <View style={s.notice}>
              <MaterialCommunityIcons name="information-outline" size={20} color={INK} />
              <Text style={s.noticeText}>
                Para grabar hay que recompilar la app (yarn · pod install · yarn ios). Mientras, puedes usar la voz del teléfono.
              </Text>
            </View>
          ) : (
            <View style={s.micArea}>
              {phase === 'recording' && <Animated.View style={[s.ring, ring]} />}
              <TouchableOpacity
                style={[s.mic, phase === 'recording' && s.micRec, phase === 'recorded' && s.micDone]}
                onPress={phase === 'recording' ? stopRec : startRec}
                accessibilityLabel={phase === 'recording' ? 'Detener' : 'Grabar'}
                disabled={!text.trim()}
              >
                <MaterialCommunityIcons
                  name={phase === 'recording' ? 'stop' : phase === 'recorded' ? 'microphone-outline' : 'microphone'}
                  size={44}
                  color="#fff"
                />
              </TouchableOpacity>
              <Text style={s.state}>
                {phase === 'recording'
                  ? `Grabando… ${fmt(ms)}`
                  : phase === 'recorded'
                    ? 'Grabación lista · toca el micrófono para repetirla'
                    : 'Toca el micrófono para grabar'}
              </Text>
            </View>
          )}

          {error && <Text style={s.error}>{error}</Text>}

          {/* Acciones */}
          <View style={s.row}>
            {phase === 'recorded' && uri ? (
              <>
                <TouchableOpacity style={[s.btn, s.flex]} onPress={playRec}>
                  <MaterialCommunityIcons name={playing ? 'stop' : 'play'} size={20} color={INK} />
                  <Text style={s.btnText}>{playing ? 'Detener' : 'Escuchar'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.btnIcon}
                  onPress={() => {
                    setUri(undefined);
                    setPhase('idle');
                  }}
                  accessibilityLabel="Borrar grabación"
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={RED} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[s.btn, s.flex]} onPress={() => sayText(text)}>
                <MaterialCommunityIcons name="volume-high" size={20} color={INK} />
                <Text style={s.btnText}>Voz del teléfono</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[s.primary, phase === 'recording' && s.disabled]}
            disabled={phase === 'recording'}
            onPress={async () => {
              await voiceRecorder.stopPlayback();
              onSave(uri);
              onClose();
            }}
          >
            <MaterialCommunityIcons name="check" size={22} color="#fff" />
            <Text style={s.primaryText}>{uri ? 'Usar esta grabación' : 'Listo'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  flex: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: BG, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 18, paddingBottom: 30 },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.18)', alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  kicker: { fontFamily: FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.7, color: INK3 },
  close: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },
  hint: { fontFamily: FONT_BODY, fontSize: 13, fontWeight: '700', color: INK3 },
  phrase: { fontFamily: FONT_DISP, fontSize: 24, fontWeight: '800', color: INK, marginTop: 4, lineHeight: 30 },

  micArea: { alignItems: 'center', paddingVertical: 24 },
  ring: { position: 'absolute', top: 24, width: 104, height: 104, borderRadius: 52, backgroundColor: RED },
  mic: {
    width: 104, height: 104, borderRadius: 52, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  micRec: { backgroundColor: RED },
  micDone: { backgroundColor: GREEN },
  state: { fontFamily: FONT_BODY, fontSize: 14, fontWeight: '800', color: INK, marginTop: 14, textAlign: 'center' },

  notice: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginVertical: 18,
  },
  noticeText: { flex: 1, fontFamily: FONT_BODY, fontSize: 13, fontWeight: '600', color: INK, lineHeight: 18 },
  error: { fontFamily: FONT_BODY, fontSize: 13, fontWeight: '700', color: RED, textAlign: 'center', marginBottom: 10 },

  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  btn: {
    height: 50, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnIcon: {
    width: 50, height: 50, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: FONT_DISP, fontSize: 15, fontWeight: '800', color: INK },
  primary: {
    height: 58, borderRadius: 16, backgroundColor: INK,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryText: { fontFamily: FONT_DISP, fontSize: 17, fontWeight: '800', color: '#fff' },
  disabled: { opacity: 0.4 },
});
