import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image,
  KeyboardAvoidingView, Platform, LayoutAnimation,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StoriesScreenProps } from '../../navigation/types';
import PictoIcon, { iconNameFor } from '../../components/pictograms/PictoIcon';
import IconPickerSheet from '../../components/common/IconPickerSheet';
import RecordAudioSheet from '../../components/stories/RecordAudioSheet';
import { useStoriesStore, newStep } from '../../stores/useStoriesStore';
import { useDialog } from '../../providers/DialogProvider';
import { pickImageFromCamera, pickImageFromLibrary } from '../../utils/pickActivityImage';
import { KIND_META, KIND_ORDER, supportColor } from '../../utils/storyKinds';
import { Story, StoryStep } from '../../../core/domain/entities';
import { T } from '../time/timeShared';

type Props = StoriesScreenProps<'StoryEditor'>;

export default function StoryEditorScreen({ navigation, route }: Props) {
  const storyId = route.params?.storyId;
  const existing = useStoriesStore(s => s.stories.find(st => st.id === storyId));
  const newBlankStory = useStoriesStore(s => s.newBlankStory);
  const saveStory = useStoriesStore(s => s.saveStory);
  const { showDialog } = useDialog();

  const [draft, setDraft] = useState<Story>(() => existing ?? newBlankStory());
  const [sel, setSel] = useState(0);
  const [picker, setPicker] = useState<null | 'main' | 'support'>(null);
  const [recording, setRecording] = useState(false);
  const dirty = useRef(false);

  const step = draft.steps[sel];
  const meta = KIND_META[step.kind];

  // ── edición ──────────────────────────────────────────────────────────────
  function patchStory(p: Partial<Story>) {
    dirty.current = true;
    setDraft(d => ({ ...d, ...p }));
  }
  function patchStep(p: Partial<StoryStep>) {
    dirty.current = true;
    setDraft(d => ({ ...d, steps: d.steps.map((st, i) => (i === sel ? { ...st, ...p } : st)) }));
  }
  function addStep() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dirty.current = true;
    setDraft(d => ({ ...d, steps: [...d.steps, { ...newStep(d.steps.length), kind: step.kind }] }));
    setSel(draft.steps.length);
  }
  function moveStep(dir: -1 | 1) {
    const j = sel + dir;
    if (j < 0 || j >= draft.steps.length) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dirty.current = true;
    setDraft(d => {
      const steps = [...d.steps];
      [steps[sel], steps[j]] = [steps[j], steps[sel]];
      return { ...d, steps };
    });
    setSel(j);
  }
  function deleteStep() {
    if (draft.steps.length === 1) {
      showDialog({ title: 'Necesita un paso', message: 'Una historia tiene que tener al menos un paso.' });
      return;
    }
    showDialog({
      title: `Eliminar paso ${sel + 1}`,
      message: step.text ? `"${step.text}"` : '¿Eliminar este paso?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            dirty.current = true;
            setDraft(d => ({ ...d, steps: d.steps.filter((_, i) => i !== sel) }));
            setSel(i => Math.max(0, i - 1));
          },
        },
      ],
    });
  }

  async function takePhoto(from: 'camera' | 'library') {
    try {
      const uri = from === 'camera' ? await pickImageFromCamera() : await pickImageFromLibrary();
      if (uri) patchStep({ mediaUrl: uri, mediaType: 'photo' });
    } catch {
      showDialog({ title: 'No se pudo abrir', message: 'Revisa los permisos de cámara y fotos en Ajustes.' });
    }
  }

  // ── guardar ──────────────────────────────────────────────────────────────
  function buildFinal(): Story | null {
    const title = draft.title.trim();
    if (!title) {
      showDialog({ title: 'Falta el nombre', message: 'Escribe cómo se llama la historia, por ejemplo "Ir al dentista".' });
      return null;
    }
    const first = draft.steps[0];
    const isBlankCover = !draft.templateId && !existing;
    return {
      ...draft,
      title,
      // Portada: la de la plantilla, o la del primer paso si se creó desde cero.
      iconKey: isBlankCover ? first.pictogramKey : draft.iconKey,
      color: isBlankCover ? { bg: KIND_META[first.kind].bg, stroke: KIND_META[first.kind].stroke } : draft.color,
      isDraft: draft.steps.some(st => !st.text.trim()),
    };
  }

  function onSave() {
    const final = buildFinal();
    if (!final) return;
    saveStory(final);
    dirty.current = false;
    navigation.goBack();
  }

  function onPreview() {
    const final = buildFinal();
    if (!final) return;
    saveStory(final);
    dirty.current = false;
    setDraft(final);
    navigation.navigate('StoryReader', { storyId: final.id });
  }

  function onBack() {
    if (!dirty.current) {
      navigation.goBack();
      return;
    }
    showDialog({
      title: 'Cambios sin guardar',
      message: '¿Quieres guardar antes de salir?',
      buttons: [
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
        { text: 'Guardar', onPress: onSave },
      ],
    });
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Barra superior */}
      <View style={s.top}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} hitSlop={8}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={T.INK} />
          <Text style={s.backText}>Historia</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Editor</Text>
        <TouchableOpacity style={s.saveBtn} onPress={onSave}>
          <Text style={s.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Nombre */}
          <TextInput
            style={s.titleInput}
            value={draft.title}
            onChangeText={t => patchStory({ title: t })}
            placeholder="Nombre de la historia"
            placeholderTextColor={T.INK3}
            maxLength={40}
          />

          {/* Pasos */}
          <Text style={s.label}>PASOS · {draft.steps.length}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.stepsScroll} contentContainerStyle={s.stepsRow}>
            {draft.steps.map((st, i) => {
              const m = KIND_META[st.kind];
              const active = i === sel;
              return (
                <TouchableOpacity key={st.id} onPress={() => setSel(i)} style={[s.stepTile, active && s.stepTileActive]}>
                  {st.mediaUrl ? (
                    <Image source={{ uri: st.mediaUrl }} style={[s.stepImg, { borderColor: m.stroke }]} />
                  ) : (
                    <PictoIcon kind={st.pictogramKey} color={m} size={52} hideLabel />
                  )}
                  <View style={[s.stepNum, active && s.stepNumActive]}>
                    <Text style={s.stepNumText}>{i + 1}</Text>
                  </View>
                  {!!st.audioUrl && (
                    <View style={s.micBadge}>
                      <MaterialCommunityIcons name="microphone" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={s.addTile} onPress={addStep} accessibilityLabel="Añadir paso">
              <MaterialCommunityIcons name="plus" size={24} color={T.INK3} />
            </TouchableOpacity>
          </ScrollView>

          <View style={s.divider} />

          {/* Paso seleccionado */}
          <View style={s.stepHeader}>
            <Text style={s.label}>PASO {sel + 1} · {meta.label}</Text>
            <View style={s.moveRow}>
              <TouchableOpacity style={[s.moveBtn, sel === 0 && s.dim]} disabled={sel === 0} onPress={() => moveStep(-1)}>
                <MaterialCommunityIcons name="chevron-left" size={20} color={T.INK} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.moveBtn, sel === draft.steps.length - 1 && s.dim]}
                disabled={sel === draft.steps.length - 1}
                onPress={() => moveStep(1)}
              >
                <MaterialCommunityIcons name="chevron-right" size={20} color={T.INK} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.kindScroll} contentContainerStyle={s.kindRow}>
            {KIND_ORDER.map(k => {
              const km = KIND_META[k];
              const active = step.kind === k;
              return (
                <TouchableOpacity
                  key={k}
                  onPress={() => patchStep({ kind: k })}
                  style={[s.kindChip, { backgroundColor: active ? km.bg : '#fff', borderColor: active ? km.stroke : T.BORDER }]}
                >
                  <Text style={[s.kindText, { color: active ? km.stroke : T.INK3 }]}>{km.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={s.mediaRow}>
            <View style={[s.thumb, { backgroundColor: meta.bg, borderColor: meta.stroke }]}>
              {step.mediaUrl ? (
                <Image source={{ uri: step.mediaUrl }} style={s.thumbImg} />
              ) : (
                <MaterialCommunityIcons name={iconNameFor(step.pictogramKey)} size={70} color={meta.stroke} />
              )}
            </View>
            <View style={s.mediaBtns}>
              <MediaBtn icon="camera-outline" label="Cambiar foto" onPress={() => takePhoto('camera')} />
              <MediaBtn icon="image-outline" label="De la galería" onPress={() => takePhoto('library')} />
              <MediaBtn icon="palette-outline" label="Pictograma" onPress={() => setPicker('main')} />
            </View>
          </View>

          {/* Frase */}
          <Text style={[s.label, s.mt]}>FRASE</Text>
          <TextInput
            style={s.phrase}
            value={step.text}
            onChangeText={t => patchStep({ text: t })}
            placeholder="Ej. Me siento en la silla."
            placeholderTextColor={T.INK3}
            multiline
            maxLength={120}
          />

          {/* Apoyo */}
          <View style={[s.stepHeader, s.mt]}>
            <Text style={s.label}>PICTOGRAMAS DE APOYO</Text>
            <TouchableOpacity onPress={() => setPicker('support')} hitSlop={8}>
              <Text style={s.addLink}>+ añadir</Text>
            </TouchableOpacity>
          </View>
          <View style={s.supportRow}>
            {step.supportPictograms.map((k, i) => (
              <TouchableOpacity
                key={`${k}-${i}`}
                onPress={() => patchStep({ supportPictograms: step.supportPictograms.filter((_, j) => j !== i) })}
                accessibilityLabel="Quitar pictograma"
              >
                <PictoIcon kind={k} color={supportColor(k)} size={50} hideLabel />
                <View style={s.removeDot}>
                  <MaterialCommunityIcons name="close" size={12} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
            {step.supportPictograms.length < 4 && (
              <TouchableOpacity style={s.addSupport} onPress={() => setPicker('support')}>
                <MaterialCommunityIcons name="plus" size={22} color={T.INK3} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Acciones */}
      <View style={s.footer}>
        <TouchableOpacity style={[s.footBtn, s.flex]} onPress={onPreview}>
          <MaterialCommunityIcons name="eye-outline" size={18} color={T.INK} />
          <Text style={s.footText}>Vista previa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.footBtn, s.flex, !!step.audioUrl && s.footBtnOn]}
          onPress={() => setRecording(true)}
        >
          <MaterialCommunityIcons name={step.audioUrl ? 'microphone-outline' : 'microphone'} size={18} color={T.INK} />
          <Text style={s.footText}>{step.audioUrl ? 'Audio ✓' : 'Grabar audio'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.trashBtn} onPress={deleteStep} accessibilityLabel="Eliminar paso">
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#B23B3B" />
        </TouchableOpacity>
      </View>

      <RecordAudioSheet
        visible={recording}
        title={`GRABAR AUDIO · PASO ${sel + 1}`}
        text={step.text}
        audioUrl={step.audioUrl}
        onClose={() => setRecording(false)}
        onSave={uri => patchStep({ audioUrl: uri })}
      />

      <IconPickerSheet
        visible={picker !== null}
        title={picker === 'support' ? 'Pictograma de apoyo' : 'Pictograma del paso'}
        color={picker === 'main' ? meta : undefined}
        colorFor={picker === 'support' ? supportColor : undefined}
        selected={picker === 'main' ? [step.pictogramKey] : step.supportPictograms}
        onClose={() => setPicker(null)}
        onSelect={key => {
          if (picker === 'main') {
            patchStep({ pictogramKey: key, mediaType: 'pictogram', mediaUrl: undefined });
          } else if (!step.supportPictograms.includes(key)) {
            patchStep({ supportPictograms: [...step.supportPictograms, key].slice(0, 4) });
          }
          setPicker(null);
        }}
      />
    </SafeAreaView>
  );
}

function MediaBtn({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.mediaBtn} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={18} color={T.INK} />
      <Text style={s.mediaBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.BG },
  flex: { flex: 1 },
  mt: { marginTop: 18 },
  dim: { opacity: 0.35 },

  top: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: T.CARD,
    borderBottomWidth: 1, borderBottomColor: T.BORDER,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 96 },
  backText: { fontFamily: T.FONT_BODY, fontSize: 14, fontWeight: '700', color: T.INK },
  topTitle: { fontFamily: T.FONT_BODY, fontSize: 16, fontWeight: '800', color: T.INK },
  saveBtn: { width: 96, height: 38, borderRadius: 10, backgroundColor: T.INK, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: T.FONT_DISP, fontSize: 14, fontWeight: '800', color: '#fff' },

  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 },
  titleInput: {
    fontFamily: T.FONT_DISP, fontSize: 22, fontWeight: '800', color: T.INK,
    backgroundColor: T.CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  label: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, color: T.INK3, marginBottom: 8 },

  stepsScroll: { flexGrow: 0 },
  stepsRow: { gap: 8, paddingTop: 8, paddingLeft: 6, paddingBottom: 4, alignItems: 'center' },
  stepTile: { borderRadius: 14, padding: 2, borderWidth: 2.5, borderColor: 'transparent' },
  stepTileActive: { borderColor: T.ACCENT },
  stepImg: { width: 52, height: 52, borderRadius: 11, borderWidth: 2.5 },
  stepNum: {
    position: 'absolute', top: -8, left: -8, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: T.INK, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  stepNumActive: { backgroundColor: T.ACCENT, borderColor: T.ACCENT },
  stepNumText: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', color: T.INK },
  addTile: {
    width: 56, height: 56, borderRadius: 13, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 2,
  },
  divider: { height: 1, backgroundColor: T.BORDER, marginVertical: 14 },

  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moveRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  moveBtn: {
    width: 32, height: 28, borderRadius: 8, backgroundColor: T.CARD,
    borderWidth: 1.5, borderColor: T.BORDER, alignItems: 'center', justifyContent: 'center',
  },

  kindScroll: { flexGrow: 0, marginBottom: 12 },
  kindRow: { gap: 6 },
  kindChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5 },
  kindText: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  mediaRow: { flexDirection: 'row', gap: 12 },
  thumb: {
    width: 124, height: 124, borderRadius: 16, borderWidth: 3, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  mediaBtns: { flex: 1, gap: 7 },
  mediaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.CARD, borderRadius: 10, paddingHorizontal: 12,
  },
  mediaBtnText: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', color: T.INK },

  phrase: {
    fontFamily: T.FONT_BODY, fontSize: 16, fontWeight: '700', color: T.INK, minHeight: 52,
    backgroundColor: T.CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
  },
  addLink: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.ACCENT, marginBottom: 8 },
  supportRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingTop: 4 },
  removeDot: {
    position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9,
    backgroundColor: T.INK, alignItems: 'center', justifyContent: 'center',
  },
  addSupport: {
    width: 50, height: 50, borderRadius: 11, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12,
    backgroundColor: T.BG, borderTopWidth: 1, borderTopColor: T.BORDER,
  },
  footBtn: {
    height: 48, borderRadius: 12, backgroundColor: '#E6E3DD',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  footBtnOn: { backgroundColor: '#D8EEDC' },
  micBadge: {
    position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#2E7D4F', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff',
  },
  footText: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', color: T.INK },
  trashBtn: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#E6E3DD', alignItems: 'center', justifyContent: 'center',
  },
});
