import { StoryStep } from '../../core/domain/entities';
import { voiceRecorder } from '../../infrastructure/audio/voiceRecorder';
import { speech } from '../../infrastructure/speech/speech';
import { useVoiceNoticeStore } from '../stores/useVoiceNoticeStore';

/**
 * Lee un texto en voz alta: la grabación de la familia si existe; si no hay
 * (o no se puede reproducir en este dispositivo), la voz del teléfono.
 * Si no hay ningún motor de voz disponible, avisa una vez al usuario.
 */
export async function playStep(step: Pick<StoryStep, 'text' | 'audioUrl'>, onEnd?: () => void) {
  speech.stop();
  if (step.audioUrl && (await voiceRecorder.play(step.audioUrl, onEnd))) return;
  if (!speech.available) {
    useVoiceNoticeStore.getState().notify();
    return;
  }
  await speech.speak(step.text).catch(() => undefined);
}

/** Dice un texto con la voz del teléfono (frases armadas, "¡Terminaste!", etc.). */
export async function sayText(text: string) {
  if (!speech.available) {
    useVoiceNoticeStore.getState().notify();
    return;
  }
  await speech.speak(text).catch(() => undefined);
}

export function stopVoice() {
  speech.stop();
  voiceRecorder.stopPlayback();
}
