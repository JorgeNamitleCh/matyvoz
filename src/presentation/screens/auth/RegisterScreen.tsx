import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/useAuthStore';
import { FirebaseAuthRepository } from '../../../data/repositories/FirebaseAuthRepository';
import { RegisterFamilyUseCase } from '../../../core/domain/usecases/auth/RegisterFamilyUseCase';
import { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'Register'>;

const authRepo = new FirebaseAuthRepository();
const registerUseCase = new RegisterFamilyUseCase(authRepo);

const RELATIONS = ['Madre', 'Padre', 'Cuidador', 'Abu', 'Tutor', 'Otro'];

const BG = '#EFEEEA';
const INK = '#2D2620';
const ACCENT = '#2A5F8F';
const BORDER = 'rgba(0,0,0,0.08)';
const INK3 = '#8a8a8a';
const INK2 = '#5a5a5a';
const FONT_DISP = 'Nunito ExtraLight';
const FONT_BODY = 'Atkinson Hyperlegible';

const H_PADDING = 22;
const GAP = 6;
const SCREEN_W = Dimensions.get('window').width;
const CHIP_W = (SCREEN_W - H_PADDING * 2 - GAP * 2) / 3;

export default function RegisterScreen({ navigation }: Props) {
  const setFamily = useAuthStore(s => s.setFamily);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Madre');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!accepted) {
      setError('Debes aceptar los términos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const family = await registerUseCase.execute(name.trim(), email.trim(), password, relation);
      setFamily(family);
    } catch (e: any) {
      const msg = e?.message ?? '';
      console.error('[Register error]', e);
      if (msg.includes('email-already-in-use')) {
        setError('Este correo ya tiene una cuenta. Inicia sesión.');
      } else if (msg.includes('invalid-email')) {
        setError('Correo no válido.');
      } else {
        setError(msg || 'No se pudo crear la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Crear cuenta</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Título */}
          <View style={s.titleBlock}>
            <Text style={s.title}>Empecemos por la familia</Text>
            <Text style={s.subtitle}>Es la cuenta de la persona adulta. Luego configuramos al peque.</Text>
          </View>

          {/* SSO */}
          <View style={s.ssoBlock}>
            <TouchableOpacity style={s.appleBtn}>
              <Text style={s.appleBtnIcon}></Text>
              <Text style={s.appleBtnText}>Registrarme con Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.googleBtn}>
              <Text style={s.googleG}>G</Text>
              <Text style={s.googleBtnText}>Registrarme con Google</Text>
            </TouchableOpacity>
          </View>

          {/* Separador */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>O CON CORREO</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Campos */}
          <Text style={s.label}>TU NOMBRE</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Marta García"
            placeholderTextColor={INK3}
          />

          <Text style={s.label}>RELACIÓN CON EL PEQUE</Text>
          <View style={s.relGrid}>
            {RELATIONS.map(r => {
              const active = relation === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => setRelation(r)}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={s.label}>CORREO</Text>
          <TextInput
            style={[s.input, s.inputEmail]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="marta@familia.com"
            placeholderTextColor={INK3}
          />

          <Text style={s.label}>CONTRASEÑA</Text>
          <TextInput
            style={[s.input, s.inputPassword]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={INK3}
          />
          <Text style={s.hint}>Mín. 8 caracteres · 1 número</Text>

          {/* Términos */}
          <TouchableOpacity style={s.checkRow} onPress={() => setAccepted(v => !v)}>
            <View style={[s.checkbox, accepted && s.checkboxActive]}>
              {accepted && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkLabel}>
              Acepto los{' '}
              <Text style={s.checkLink}>términos</Text>
              {' '}y la{' '}
              <Text style={s.checkLink}>política de privacidad</Text>
              {'. '}La información del peque se guarda cifrada y solo la verás tú.
            </Text>
          </TouchableOpacity>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {/* Botón */}
          <TouchableOpacity
            style={[s.primaryBtn, loading && s.disabledBtn]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryBtnText}>Crear cuenta y continuar</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: H_PADDING, paddingTop: 4, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  backArrow: { fontSize: 16, color: INK },
  headerTitle: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 15, color: INK },

  scroll: { flexGrow: 1, paddingHorizontal: H_PADDING, paddingBottom: 22 },

  titleBlock: { paddingTop: 12, paddingBottom: 4, marginBottom: 4 },
  title: { fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', lineHeight: 29, color: INK },
  subtitle: { fontFamily: FONT_BODY, fontSize: 13, color: INK3, marginTop: 6, lineHeight: 18 },

  ssoBlock: { marginTop: 16, marginBottom: 4 },
  appleBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#000',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  appleBtnIcon: { color: '#fff', fontSize: 18, marginRight: 10 },
  appleBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 14 },
  googleBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: BORDER,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  googleG: { fontSize: 16, fontWeight: '700', color: '#4285F4', marginRight: 10 },
  googleBtnText: { fontFamily: FONT_DISP, color: INK, fontWeight: '800', fontSize: 14 },

  divider: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontFamily: FONT_BODY, marginHorizontal: 10, fontSize: 10, fontWeight: '800', letterSpacing: 1, color: INK3 },

  label: { fontFamily: FONT_BODY, fontSize: 10, color: INK3, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    fontFamily: FONT_DISP,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1.5, borderColor: BORDER,
    fontSize: 16, fontWeight: '700', color: INK,
    marginBottom: 10,
  },
  inputEmail: { fontFamily: FONT_BODY, fontSize: 14, fontWeight: '600' },
  inputPassword: { letterSpacing: 3, marginBottom: 4 },

  relGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: GAP,
    marginBottom: 10,
  },
  chip: {
    width: CHIP_W,
    paddingVertical: 10, paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: INK, borderColor: INK },
  chipText: { fontFamily: FONT_DISP, fontSize: 12, fontWeight: '800', color: INK },
  chipTextActive: { color: '#fff' },

  hint: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '600', marginBottom: 10 },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10, marginTop: 2, flexShrink: 0,
  },
  checkboxActive: { backgroundColor: INK, borderColor: INK },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  checkLabel: { fontFamily: FONT_BODY, flex: 1, fontSize: 12, color: INK2, lineHeight: 17 },
  checkLink: { color: ACCENT, fontWeight: '700' },

  error: { fontFamily: FONT_BODY, color: '#D32F2F', fontSize: 13, marginBottom: 8 },

  primaryBtn: {
    height: 56, borderRadius: 14, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 16 },
});
