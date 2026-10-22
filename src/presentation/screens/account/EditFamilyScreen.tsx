import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/useAuthStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import { accountUseCases } from '../../../infrastructure/di/container';
import { RELATIONS } from '../../utils/profileOptions';
import { BG, SURFACE, SURFACE_ALT, INK, INK3, BORDER, PRIMARY, DANGER, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

type Props = RootScreenProps<'EditFamily'>;

const H_PADDING = 22;
const GAP = 6;
const CHIP_W = (Dimensions.get('window').width - H_PADDING * 2 - GAP * 2) / 3;

export default function EditFamilyScreen({ navigation }: Props) {
  const family = useAuthStore(s => s.family);
  const setFamily = useAuthStore(s => s.setFamily);

  const [name, setName] = useState(family?.name ?? '');
  const [relation, setRelation] = useState(family?.role ?? 'Madre');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!family) return;
    setError('');
    setSaving(true);
    try {
      const updated = await accountUseCases.updateFamily.execute(family.id, { name, role: relation });
      setFamily(updated);
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo guardar. Revisa tu conexión.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="Tu cuenta" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.label}>TU NOMBRE</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Marta García"
            placeholderTextColor={INK3}
          />

          <Text style={s.label}>RELACIÓN</Text>
          <View style={s.relGrid}>
            {RELATIONS.map(r => {
              const active = relation === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => setRelation(r)}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={s.label}>CORREO</Text>
          <View style={[s.input, s.inputDisabled]}>
            <Text style={s.disabledText}>{family?.email}</Text>
          </View>
          <Text style={s.hint}>El correo es tu forma de entrar y no se puede cambiar desde la app.</Text>

          {error ? <Text style={s.error}>{error}</Text> : null}
        </ScrollView>

        <View style={s.bottom}>
          <TouchableOpacity
            style={[s.primaryBtn, saving && s.disabledBtn]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Guardar</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: H_PADDING, paddingTop: 12, paddingBottom: 22 },

  label: { fontFamily: FONT_BODY, fontSize: 10, color: INK3, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    fontFamily: FONT_DISP,
    backgroundColor: SURFACE, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1.5, borderColor: BORDER,
    fontSize: 16, fontWeight: '700', color: INK,
    marginBottom: 14,
  },
  inputDisabled: { backgroundColor: SURFACE_ALT, marginBottom: 6 },
  disabledText: { fontFamily: FONT_BODY, fontSize: 14, fontWeight: '600', color: INK3 },
  hint: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '600', marginBottom: 10 },

  relGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginBottom: 14 },
  chip: {
    width: CHIP_W, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipText: { fontFamily: FONT_DISP, fontSize: 12, fontWeight: '800', color: INK },
  chipTextActive: { color: '#fff' },

  error: { fontFamily: FONT_BODY, color: DANGER, fontSize: 13, marginBottom: 8 },

  bottom: { paddingHorizontal: H_PADDING, paddingTop: 8, paddingBottom: 12 },
  primaryBtn: {
    height: 56, borderRadius: 14, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 16 },
}));
