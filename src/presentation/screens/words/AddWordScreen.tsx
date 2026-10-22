import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WordsScreenProps } from '../../navigation/types';
import PictogramPicker, { PictogramMode } from '../../components/common/PictogramPicker';
import RecordAudioSheet from '../../components/stories/RecordAudioSheet';
import { useWordsStore } from '../../stores/useWordsStore';
import { useDialog } from '../../providers/DialogProvider';
import { WORD_SECTIONS, sectionOf } from '../../utils/wordCategories';
import { Word } from '../../../core/domain/entities';
import { T } from '../time/timeShared';
import { SURFACE, OK_SOFT, themedStyles } from '../../theme/tokens';

type Props = WordsScreenProps<'AddWord'>;

export default function AddWordScreen({ navigation, route }: Props) {
  const existing = useWordsStore(s => s.words.find(w => w.id === route.params?.wordId));
  const words = useWordsStore(s => s.words);
  const newWord = useWordsStore(s => s.newWord);
  const saveWord = useWordsStore(s => s.saveWord);
  const { showDialog } = useDialog();

  const [draft, setDraft] = useState<Word>(() => existing ?? newWord(route.params?.category));
  const [mode, setMode] = useState<PictogramMode>(draft.photoUrl ? 'image' : 'icon');
  const [variantsText, setVariantsText] = useState(draft.variants.join(', '));
  const [recording, setRecording] = useState(false);

  const sec = sectionOf(draft.category);
  const patch = (p: Partial<Word>) => setDraft(d => ({ ...d, ...p }));

  function onSave() {
    const label = draft.label.trim().toLowerCase();
    if (!label) {
      showDialog({ title: 'Falta la palabra', message: 'Escribe la palabra, por ejemplo "mamá" o "parque".' });
      return;
    }
    const dup = words.find(w => w.id !== draft.id && w.label.toLowerCase() === label);
    if (dup) {
      showDialog({ title: 'Ya existe', message: `"${dup.label}" ya está en el glosario.` });
      return;
    }
    saveWord({
      ...draft,
      label,
      photoUrl: mode === 'image' ? draft.photoUrl : undefined,
      variants: variantsText.split(',').map(v => v.trim()).filter(Boolean),
      subtitle: draft.subtitle?.trim() || undefined,
      syllables: draft.syllables.trim(),
      description: draft.description.trim(),
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.top}>
        <TouchableOpacity style={s.topBtn} onPress={() => navigation.goBack()} accessibilityLabel="Cerrar">
          <MaterialCommunityIcons name="close" size={22} color={T.INK} />
        </TouchableOpacity>
        <Text style={s.topTitle}>{existing ? 'Editar palabra' : 'Nueva palabra'}</Text>
        <TouchableOpacity style={s.saveBtn} onPress={onSave}>
          <Text style={s.saveText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.label}>PALABRA</Text>
          <TextInput
            style={s.wordInput}
            value={draft.label}
            onChangeText={t => patch({ label: t })}
            placeholder="ej. mamá"
            placeholderTextColor={T.INK3}
            autoCapitalize="none"
            maxLength={30}
          />

          <Text style={s.label}>SECCIÓN</Text>
          <View style={s.chips}>
            {WORD_SECTIONS.map(w => {
              const active = draft.category === w.key;
              return (
                <TouchableOpacity
                  key={w.key}
                  onPress={() => patch({ category: w.key })}
                  style={[s.chip, { backgroundColor: active ? w.bg : SURFACE, borderColor: active ? w.stroke : T.BORDER }]}
                >
                  <Text style={[s.chipText, { color: active ? w.stroke : T.INK3 }]}>{w.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.box}>
            <PictogramPicker
              label="DIBUJO O FOTO"
              mode={mode}
              onModeChange={setMode}
              iconKey={draft.iconKey}
              onIconKeyChange={k => patch({ iconKey: k })}
              imageUri={draft.photoUrl}
              onImageUriChange={uri => patch({ photoUrl: uri })}
              color={sec}
            />
          </View>

          <Text style={s.label}>VOZ</Text>
          <TouchableOpacity style={[s.voiceBtn, !!draft.audioUrl && s.voiceOn]} onPress={() => setRecording(true)}>
            <MaterialCommunityIcons name="microphone" size={20} color={T.INK} />
            <Text style={s.voiceText}>{draft.audioUrl ? 'Grabación lista · cambiar' : 'Grabar cómo lo decimos en casa'}</Text>
          </TouchableOpacity>

          <Text style={s.label}>DEBAJO DEL NOMBRE (OPCIONAL)</Text>
          <TextInput
            style={s.input}
            value={draft.subtitle ?? ''}
            onChangeText={t => patch({ subtitle: t })}
            placeholder="ej. Marta · 38"
            placeholderTextColor={T.INK3}
          />

          <View style={s.row}>
            <View style={s.flex}>
              <Text style={s.label}>SÍLABAS</Text>
              <TextInput
                style={s.input}
                value={draft.syllables}
                onChangeText={t => patch({ syllables: t })}
                placeholder="ma · má"
                placeholderTextColor={T.INK3}
              />
            </View>
            <View style={s.flex}>
              <Text style={s.label}>VARIANTES</Text>
              <TextInput
                style={s.input}
                value={variantsText}
                onChangeText={setVariantsText}
                placeholder="mami, ma"
                placeholderTextColor={T.INK3}
                autoCapitalize="none"
              />
            </View>
          </View>

          <Text style={s.label}>DESCRIPCIÓN</Text>
          <TextInput
            style={[s.input, s.multiline]}
            value={draft.description}
            onChangeText={t => patch({ description: t })}
            placeholder="ej. Mi mamá se llama Marta. Cocina rico y me lee cuentos."
            placeholderTextColor={T.INK3}
            multiline
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <RecordAudioSheet
        visible={recording}
        title="GRABAR PALABRA"
        text={draft.label || ' '}
        audioUrl={draft.audioUrl}
        onClose={() => setRecording(false)}
        onSave={uri => patch({ audioUrl: uri })}
      />
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: T.BG },
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  top: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  topBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: T.CARD,
    borderWidth: 1.5, borderColor: T.BORDER, alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontFamily: T.FONT_BODY, fontSize: 16, fontWeight: '800', color: T.INK },
  saveBtn: { height: 40, paddingHorizontal: 16, borderRadius: 10, backgroundColor: T.PRIMARY, justifyContent: 'center' },
  saveText: { fontFamily: T.FONT_DISP, fontSize: 14, fontWeight: '800', color: '#fff' },

  content: { paddingHorizontal: 16, paddingBottom: 30 },
  label: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, color: T.INK3, marginTop: 16, marginBottom: 8 },
  wordInput: {
    fontFamily: T.FONT_DISP, fontSize: 26, fontWeight: '800', color: T.INK,
    backgroundColor: T.CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  input: {
    fontFamily: T.FONT_BODY, fontSize: 15, fontWeight: '700', color: T.INK,
    backgroundColor: T.CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  chipText: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  box: { backgroundColor: T.CARD, borderRadius: 16, padding: 14, marginTop: 16 },
  voiceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.CARD,
    borderRadius: 12, paddingHorizontal: 14, height: 50,
  },
  voiceOn: { backgroundColor: OK_SOFT },
  voiceText: { fontFamily: T.FONT_BODY, fontSize: 14, fontWeight: '800', color: T.INK },
}));
