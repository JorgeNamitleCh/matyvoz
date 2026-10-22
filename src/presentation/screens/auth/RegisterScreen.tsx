import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../stores/useAuthStore';
import { AuthScreenProps } from '../../navigation/types';
import AuthHero from '../../components/auth/AuthHero';
import AuthField from '../../components/auth/AuthField';
import { accountUseCases } from '../../../infrastructure/di/container';
import { LEGAL } from '../../../infrastructure/config/legal';
import { FEATURES } from '../../../infrastructure/config/features';
import { BG, SURFACE, INK, INK2, INK3, BORDER, LINE_STRONG, ACCENT, PRIMARY, DANGER, DANGER_BG, OK, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

const FORM_MAX_WIDTH = 560;

type Props = AuthScreenProps<'Register'>;

const RELATIONS = ['Madre', 'Padre', 'Cuidador', 'Abu', 'Tutor', 'Otro'];

export default function RegisterScreen({ navigation }: Props) {
  const setFamily = useAuthStore(s => s.setFamily);
  // En iPad el formulario no se estira a todo lo ancho.
  const formWidth = Math.min(FORM_MAX_WIDTH, useWindowDimensions().width - 32);

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Madre');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rules = [
    { label: '8 caracteres o más', ok: password.length >= 8 },
    { label: 'Al menos 1 número', ok: /\d/.test(password) },
  ];
  const passwordOk = rules.every(r => r.ok);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Completa tu nombre, correo y contraseña.');
      return;
    }
    if (!passwordOk) {
      setError('La contraseña necesita 8 caracteres o más y al menos 1 número.');
      return;
    }
    if (!accepted) {
      setError('Para continuar, acepta los términos y el aviso de privacidad.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const family = await accountUseCases.register.execute(name.trim(), email.trim(), password, relation);
      setFamily(family);
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('email-already-in-use')) {
        setError('Este correo ya tiene una cuenta. Inicia sesión.');
      } else if (msg.includes('invalid-email')) {
        setError('Ese correo no es válido.');
      } else if (msg.includes('network')) {
        setError('Sin conexión. Revisa tu internet e inténtalo de nuevo.');
      } else {
        setError('No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clear = (fn: (v: string) => void) => (v: string) => { fn(v); setError(''); };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
          <AuthHero
            compact
            title="Crear cuenta"
            subtitle="Es la cuenta de la persona adulta. Después configuramos el perfil."
            onBack={() => navigation.goBack()}
          />

          <View style={[s.card, { width: formWidth }]}>
            {FEATURES.socialSignIn && (
              <>
                <TouchableOpacity style={s.appleBtn}>
                  <MaterialCommunityIcons name="apple" size={20} color="#fff" />
                  <Text style={s.appleBtnText}>Registrarme con Apple</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.googleBtn}>
                  <MaterialCommunityIcons name="google" size={18} color="#4285F4" />
                  <Text style={s.googleBtnText}>Registrarme con Google</Text>
                </TouchableOpacity>
                <View style={s.divider}>
                  <View style={s.dividerLine} />
                  <Text style={s.dividerText}>o con tu correo</Text>
                  <View style={s.dividerLine} />
                </View>
              </>
            )}

            <AuthField
              label="Tu nombre"
              icon="account-outline"
              value={name}
              onChangeText={clear(setName)}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              placeholder="Marta García"
            />

            <Text style={s.label}>Relación con quien acompañas</Text>
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

            <AuthField
              label="Correo"
              icon="email-outline"
              value={email}
              onChangeText={clear(setEmail)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="tucorreo@ejemplo.com"
            />

            <AuthField
              label="Contraseña"
              icon="lock-outline"
              password
              value={password}
              onChangeText={clear(setPassword)}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              placeholder="Crea una contraseña"
            />
            <View style={s.rules}>
              {rules.map(r => (
                <View key={r.label} style={s.rule}>
                  <MaterialCommunityIcons
                    name={r.ok ? 'check-circle' : 'circle-outline'}
                    size={16}
                    color={r.ok ? OK : INK3}
                  />
                  <Text style={[s.ruleText, r.ok && s.ruleTextOk]}>{r.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={s.checkRow}
              onPress={() => { setAccepted(v => !v); setError(''); }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
            >
              <View style={[s.checkbox, accepted && s.checkboxActive]}>
                {accepted && <MaterialCommunityIcons name="check" size={15} color="#fff" />}
              </View>
              <Text style={s.checkLabel}>
                Acepto los{' '}
                <Text style={s.checkLink} onPress={() => Linking.openURL(LEGAL.termsUrl)}>términos</Text>
                {' '}y el{' '}
                <Text style={s.checkLink} onPress={() => Linking.openURL(LEGAL.privacyUrl)}>aviso de privacidad</Text>
                . Los datos del perfil solo los ves tú.
              </Text>
            </TouchableOpacity>

            {error ? (
              <View style={s.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={DANGER} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.primaryBtn, loading && s.disabledBtn]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.primaryBtnText}>Crear cuenta</Text>}
            </TouchableOpacity>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={s.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 16 },

  card: {
    backgroundColor: SURFACE,
    alignSelf: 'center', marginTop: -32,
    borderRadius: 24, padding: 22,
    shadowColor: '#1d2a36', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 6,
  },

  appleBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#000',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 10,
  },
  appleBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 15 },
  googleBtn: {
    height: 52, borderRadius: 14, backgroundColor: SURFACE,
    borderWidth: 1.5, borderColor: BORDER,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  googleBtnText: { fontFamily: FONT_DISP, color: INK, fontWeight: '800', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontFamily: FONT_BODY, marginHorizontal: 10, fontSize: 12, fontWeight: '600', color: INK3 },

  label: { fontFamily: FONT_BODY, fontSize: 12, color: INK, fontWeight: '700', marginBottom: 6 },
  relGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    flexBasis: '30%', flexGrow: 1,
    height: 42, borderRadius: 12,
    backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: PRIMARY },
  chipText: { fontFamily: FONT_DISP, fontSize: 13, fontWeight: '800', color: INK },
  chipTextActive: { color: '#fff' },

  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: -6, marginBottom: 16 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ruleText: { fontFamily: FONT_BODY, fontSize: 12, color: INK3, fontWeight: '600' },
  ruleTextOk: { color: OK },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 1.5, borderColor: LINE_STRONG, backgroundColor: SURFACE,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkLabel: { flex: 1, fontFamily: FONT_BODY, fontSize: 13, color: INK2, lineHeight: 19 },
  checkLink: { color: ACCENT, fontWeight: '700' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DANGER_BG, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 4,
  },
  errorText: { flex: 1, fontFamily: FONT_BODY, fontSize: 13, fontWeight: '600', color: DANGER },

  primaryBtn: {
    height: 54, borderRadius: 14, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
  },
  disabledBtn: { opacity: 0.6 },
  primaryBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 16 },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 22 },
  footerText: { fontFamily: FONT_BODY, fontSize: 14, color: INK3, fontWeight: '600' },
  footerLink: { fontFamily: FONT_BODY, fontSize: 14, color: ACCENT, fontWeight: '800' },
}));
