import { PermissionsAndroid, Platform, TurboModuleRegistry, NativeModules } from 'react-native';
import type { RecordBackType } from 'react-native-nitro-sound';

type SoundType = typeof import('react-native-nitro-sound').default;

/**
 * Grabar y reproducir la voz de la familia (audio de cada paso de una
 * historia). Envoltura sobre react-native-nitro-sound, cargada de forma
 * perezosa: si el módulo nativo no está enlazado todavía, `available` es
 * false y la app sigue funcionando (el lector usa la voz del teléfono).
 *
 * Los audios se guardan como archivo en el almacenamiento privado de la app
 * (Documents en iOS, filesDir en Android) — viven en ESTE dispositivo.
 */
let sound: SoundType | null | undefined;

/** ¿Está enlazado el módulo nativo de Nitro? (sin cargarlo, para no disparar errores) */
function nitroLinked(): boolean {
  try {
    return TurboModuleRegistry.get('NitroModules') != null || NativeModules.NitroModules != null;
  } catch {
    return false;
  }
}

function getSound(): SoundType | null {
  if (sound !== undefined) return sound;
  if (!nitroLinked()) {
    console.warn('[voiceRecorder] NitroModules no está enlazado: corre `yarn`, `pod install` y recompila.');
    sound = null;
    return sound;
  }
  try {
     
    sound = require('react-native-nitro-sound').default as SoundType;
  } catch (err) {
    console.warn('[voiceRecorder] react-native-nitro-sound no está enlazado: corre `yarn` y `pod install` y recompila.', err);
    sound = null;
  }
  return sound;
}

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true; // iOS lo pide solo (NSMicrophoneUsageDescription)
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
    title: 'Micrófono',
    message: 'MatyVoz necesita el micrófono para grabar tu voz leyendo la historia.',
    buttonPositive: 'Permitir',
    buttonNegative: 'Ahora no',
  });
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

let playing = false;

export const voiceRecorder = {
  get available(): boolean {
    return getSound() !== null;
  },

  /** Empieza a grabar. `onTick` recibe los milisegundos grabados. */
  async start(onTick?: (ms: number) => void): Promise<boolean> {
    const s = getSound();
    if (!s) return false;
    if (!(await ensureMicPermission())) return false;
    await this.stopPlayback();
    s.setSubscriptionDuration(0.1);
    s.removeRecordBackListener();
    if (onTick) s.addRecordBackListener((e: RecordBackType) => onTick(e.currentPosition));
    await s.startRecorder(undefined, { AudioQuality: 'medium', AudioChannels: 1 });
    return true;
  },

  /** Detiene la grabación y devuelve la ruta del archivo. */
  async stop(): Promise<string | null> {
    const s = getSound();
    if (!s) return null;
    try {
      const uri = await s.stopRecorder();
      s.removeRecordBackListener();
      return uri || null;
    } catch {
      return null;
    }
  },

  /** Reproduce un audio grabado. Resuelve false si no se pudo. */
  async play(uri: string, onEnd?: () => void): Promise<boolean> {
    const s = getSound();
    if (!s || !uri) return false;
    try {
      await this.stopPlayback();
      s.removePlaybackEndListener();
      s.addPlaybackEndListener(() => {
        playing = false;
        onEnd?.();
      });
      await s.startPlayer(uri);
      playing = true;
      return true;
    } catch (err) {
      console.warn('[voiceRecorder] no se pudo reproducir', uri, err);
      return false;
    }
  },

  async stopPlayback() {
    const s = getSound();
    if (!s || !playing) return;
    playing = false;
    try {
      await s.stopPlayer();
    } catch {
      /* ya estaba detenido */
    }
  },
};
