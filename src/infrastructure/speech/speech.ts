import { NativeModules, Platform } from 'react-native';
import type TtsType from 'react-native-tts';

/**
 * Texto a voz (lee en voz alta palabras, frases e historias).
 * Envoltura sobre react-native-tts:
 * - se carga de forma perezosa: si el módulo nativo no está enlazado, la app
 *   sigue funcionando y simplemente no habla;
 * - cada llamada nativa va protegida: un error de la librería nunca debe
 *   tumbar la pantalla (ver patches/react-native-tts+4.1.1.patch para iOS).
 */
let tts: typeof TtsType | null | undefined;

/** Velocidad: más lenta de lo normal, para niños. */
const RATE = Platform.OS === 'ios' ? 0.42 : 0.85;
let ready = false;

/** Ejecuta una llamada nativa sin dejar escapar errores (sync ni promesas). */
function safe(fn: () => unknown): Promise<void> {
  try {
    return Promise.resolve(fn()).then(
      () => undefined,
      err => console.warn('[speech]', err?.message ?? err),
    );
  } catch (err) {
    console.warn('[speech]', (err as Error)?.message ?? err);
    return Promise.resolve();
  }
}

function getTts(): typeof TtsType | null {
  if (tts !== undefined) return tts;
  if (!NativeModules.TextToSpeech) {
    console.warn('[speech] react-native-tts no está enlazado: corre `yarn`, `pod install` y recompila.');
    tts = null;
    return tts;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    tts = require('react-native-tts').default as typeof TtsType;
  } catch (err) {
    console.warn('[speech] no se pudo cargar react-native-tts', err);
    tts = null;
  }
  return tts;
}

async function init(t: typeof TtsType) {
  if (ready) return;
  ready = true;
  if (Platform.OS === 'android') {
    try {
      await t.getInitStatus();
    } catch (err) {
      // Android sin motor de voz instalado: pide instalarlo.
      if ((err as { code?: string })?.code === 'no_engine') await safe(() => t.requestInstallEngine());
    }
  }
  await safe(() => t.setDefaultLanguage('es-MX')).then(() => undefined);
  if (Platform.OS === 'android') await safe(() => t.setDefaultRate(RATE));
  await safe(() => t.setDucking(true));
  // iOS: que se oiga aunque el iPhone esté en modo silencio (switch lateral).
  if (Platform.OS === 'ios') await safe(() => t.setIgnoreSilentSwitch('ignore'));
}

export const speech = {
  /** ¿Hay voz disponible en esta compilación? */
  get available(): boolean {
    return getTts() !== null;
  },

  async speak(text: string) {
    const t = getTts();
    if (!t || !text.trim()) return;
    await init(t);
    await safe(() => t.stop(false));
    // La velocidad va en cada frase (en iOS setDefaultRate usa un parámetro
    // que la nueva arquitectura no convierte en versiones sin parche).
    await safe(() =>
      Platform.OS === 'ios'
        ? t.speak(text, { rate: RATE } as never)
        : t.speak(text, { androidParams: { KEY_PARAM_STREAM: 'STREAM_MUSIC' } } as never),
    );
  },

  stop() {
    const t = getTts();
    if (t) safe(() => t.stop(false));
  },
};
