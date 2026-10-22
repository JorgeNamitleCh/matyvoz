import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChildStore } from '../../stores/useChildStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import {
  CommunicationType, Neurodivergence, ProfileType, Sensitivity, SupportType,
} from '../../../core/domain/entities';
import { COMMUNICATIONS, NEUROS, PROFILE_TYPES, SENSITIVITIES, SUPPORTS } from '../../utils/profileOptions';
import { BG, SURFACE, INK, INK3, BORDER, LINE_STRONG, ACCENT, ACCENT_FILL, PRIMARY, DANGER, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

type Props = RootScreenProps<'EditPerson'>;

const PERSONA_BG = '#FFE66B';
const PERSONA_STROKE = '#1f1a0a';

function toggle<T>(list: T[], key: T): T[] {
  return list.includes(key) ? list.filter(k => k !== key) : [...list, key];
}

export default function EditPersonScreen({ navigation }: Props) {
  const familyId = useAuthStore(s => s.family?.id);
  const child = useChildStore(s => s.currentChild);
  const save = useChildStore(s => s.save);

  const [profileType, setProfileType] = useState<ProfileType>(child?.profileType ?? 'child');
  const [name, setName] = useState(child?.name ?? '');
  const [age, setAge] = useState(child ? String(child.age) : '');
  const [neuros, setNeuros] = useState<Neurodivergence[]>(child?.neurodivergence ?? []);
  const [communication, setCommunication] = useState<CommunicationType>(child?.communicationType ?? 'mixed');
  const [sensitivities, setSensitivities] = useState<Sensitivity[]>(child?.sensitivities ?? []);
  const [support, setSupport] = useState<SupportType>(child?.supportType ?? 'pictograms');
  const [minimalAnimations, setMinimalAnimations] = useState(child?.minimalAnimations ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!familyId) return;
    setError('');
    setSaving(true);
    try {
      await save({
        id: child?.id,
        familyId,
        profileType,
        name,
        age: parseInt(age, 10),
        neurodivergence: neuros,
        communicationType: communication,
        sensitivities,
        supportType: support,
        minimalAnimations,
      });
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
        <ScreenHeader title={child ? 'Editar perfil' : 'Nuevo perfil'} onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.subtitle}>
            Esto adapta el ritmo de las historias y el tipo de apoyo visual. Puedes cambiarlo cuando quieras.
          </Text>

          {/* Para quién */}
          <Text style={s.label}>¿A QUIÉN ACOMPAÑA MATYVOZ?</Text>
          <View style={s.typeRow}>
            {PROFILE_TYPES.map(t => {
              const active = profileType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[s.typeCard, active && s.typeCardActive]}
                  onPress={() => setProfileType(t.key)}
                  accessibilityState={{ selected: active }}
                >
                  <View style={s.typeIcon}>
                    <MaterialCommunityIcons name={t.icon} size={26} color={PERSONA_STROKE} />
                  </View>
                  <Text style={s.typeLabel}>{t.label}</Text>
                  <Text style={s.typeDesc}>{t.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Nombre y edad */}
          <View style={s.nameRow}>
            <View style={s.flex}>
              <Text style={s.label}>NOMBRE</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder={profileType === 'adult' ? 'Andrea' : 'Mateo'}
                placeholderTextColor={INK3}
              />
            </View>
            <View style={s.ageCol}>
              <Text style={s.label}>EDAD</Text>
              <TextInput
                style={[s.input, s.ageInput]}
                value={age}
                onChangeText={v => setAge(v.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="7"
                placeholderTextColor={INK3}
              />
            </View>
          </View>

          {/* Condición */}
          <Text style={s.label}>CONDICIÓN (OPCIONAL)</Text>
          <View style={s.wrap}>
            {NEUROS.map(n => {
              const active = neuros.includes(n.key);
              return (
                <TouchableOpacity
                  key={n.key}
                  style={[s.neuroChip, active && s.chipActive]}
                  onPress={() => setNeuros(prev => toggle(prev, n.key))}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[s.neuroLabel, active && s.textOnDark]}>{n.label}</Text>
                  <Text style={[s.neuroDesc, active && s.textOnDarkSoft]}>{n.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={s.hint}>Puedes marcar más de una. Solo tú puedes ver este dato.</Text>

          {/* Comunicación */}
          <Text style={s.label}>COMUNICACIÓN</Text>
          <View style={s.segment}>
            {COMMUNICATIONS.map(c => {
              const active = communication === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[s.segmentBtn, active && s.segmentBtnActive]}
                  onPress={() => setCommunication(c.key)}
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[s.segmentText, active && s.textOnDark]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sensibilidades */}
          <Text style={s.label}>SENSIBILIDADES (OPCIONAL)</Text>
          <View style={s.wrap}>
            {SENSITIVITIES.map(o => {
              const active = sensitivities.includes(o.key);
              return (
                <TouchableOpacity
                  key={o.key}
                  style={[s.pill, active && s.pillActive]}
                  onPress={() => setSensitivities(prev => toggle(prev, o.key))}
                  accessibilityState={{ selected: active }}
                >
                  <MaterialCommunityIcons name={active ? 'check' : o.icon} size={16} color={active ? '#fff' : INK} />
                  <Text style={[s.pillText, active && s.textOnDark]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Apoyo visual */}
          <Text style={[s.label, s.labelGap]}>APOYO VISUAL</Text>
          <View style={s.grid2}>
            {SUPPORTS.map(o => {
              const active = support === o.key;
              return (
                <TouchableOpacity
                  key={o.key}
                  style={[s.supportCard, active && s.chipActive]}
                  onPress={() => setSupport(o.key)}
                  accessibilityState={{ selected: active }}
                >
                  <MaterialCommunityIcons name={o.icon} size={22} color={active ? '#fff' : INK} />
                  <Text style={[s.supportText, active && s.textOnDark]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sobreestimulación */}
          <Text style={s.label}>SOBREESTIMULACIÓN</Text>
          <View style={s.switchRow}>
            <View style={s.flex}>
              <Text style={s.switchLabel}>Animaciones mínimas</Text>
              <Text style={s.switchDesc}>Menos movimiento en pantalla.</Text>
            </View>
            <Switch
              value={minimalAnimations}
              onValueChange={setMinimalAnimations}
              trackColor={{ true: ACCENT, false: LINE_STRONG }}
              thumbColor="#fff"
            />
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}
        </ScrollView>

        <View style={s.bottom}>
          <TouchableOpacity
            style={[s.primaryBtn, saving && s.disabledBtn]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Guardar perfil</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 22 },

  subtitle: { fontFamily: FONT_BODY, fontSize: 13, color: INK3, lineHeight: 18, marginTop: 4, marginBottom: 16 },
  label: { fontFamily: FONT_BODY, fontSize: 10, color: INK3, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  labelGap: { marginTop: 4 },
  hint: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '600', marginTop: -4, marginBottom: 14 },

  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeCard: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 14, padding: 12,
    borderWidth: 2, borderColor: BORDER,
  },
  typeCardActive: { borderColor: INK },
  typeIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: PERSONA_BG,
    borderWidth: 2, borderColor: PERSONA_STROKE,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  typeLabel: { fontFamily: FONT_DISP, fontSize: 14, fontWeight: '800', color: INK },
  typeDesc: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, marginTop: 2, lineHeight: 15 },

  nameRow: { flexDirection: 'row', gap: 10 },
  ageCol: { width: 90 },
  input: {
    fontFamily: FONT_DISP,
    backgroundColor: SURFACE, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1.5, borderColor: BORDER,
    fontSize: 16, fontWeight: '700', color: INK,
    marginBottom: 14,
  },
  ageInput: { textAlign: 'center' },

  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  neuroChip: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
  },
  neuroLabel: { fontFamily: FONT_DISP, fontSize: 14, fontWeight: '800', color: INK },
  neuroDesc: { fontFamily: FONT_BODY, fontSize: 10, color: INK3 },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  textOnDark: { color: '#fff' },
  textOnDarkSoft: { color: 'rgba(255,255,255,0.75)' },

  segment: {
    flexDirection: 'row', backgroundColor: SURFACE, borderRadius: 12, padding: 3,
    borderWidth: 1.5, borderColor: BORDER, marginBottom: 14,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: PRIMARY },
  segmentText: { fontFamily: FONT_DISP, fontSize: 13, fontWeight: '800', color: INK },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
  },
  pillActive: { backgroundColor: ACCENT_FILL, borderColor: ACCENT },
  pillText: { fontFamily: FONT_DISP, fontSize: 13, fontWeight: '800', color: INK },

  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  supportCard: {
    width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
  },
  supportText: { fontFamily: FONT_DISP, fontSize: 13, fontWeight: '800', color: INK },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: SURFACE, borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: BORDER, marginBottom: 14,
  },
  switchLabel: { fontFamily: FONT_DISP, fontSize: 15, fontWeight: '800', color: INK },
  switchDesc: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, marginTop: 2 },

  error: { fontFamily: FONT_BODY, color: DANGER, fontSize: 13, marginBottom: 8 },

  bottom: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 12 },
  primaryBtn: {
    height: 56, borderRadius: 14, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 16 },
}));
