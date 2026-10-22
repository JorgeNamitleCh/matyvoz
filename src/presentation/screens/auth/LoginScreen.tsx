import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '../../stores/useAuthStore';
import { AuthScreenProps } from '../../navigation/types';
import { useDialog } from '../../providers/DialogProvider';
import AuthHero from '../../components/auth/AuthHero';
import AuthField from '../../components/auth/AuthField';
import { accountUseCases } from '../../../infrastructure/di/container';
import { FEATURES } from '../../../infrastructure/config/features';
import { LEGAL } from '../../../infrastructure/config/legal';
import { BG, SURFACE, INK, INK3, BORDER, ACCENT, PRIMARY, DANGER, DANGER_BG, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

type Props = AuthScreenProps<'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const setFamily = useAuthStore(s => s.setFamily);
  const { showDialog } = useDialog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleForgot = async () => {
    if (!email.trim()) {
      setError('Escribe tu correo y vuelve a tocar "¿Olvidaste tu contraseña?".');
      return;
    }
    setError('');
    try {
      await accountUseCases.sendPasswordReset.execute(email);
    } catch {
      // Por seguridad no revelamos si el correo tiene cuenta.
    }
    showDialog({
      title: 'Revisa tu correo',
      message: `Si ${email.trim()} tiene una cuenta, te enviamos un enlace para crear una contraseña nueva.`,
    });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Escribe tu correo y tu contraseña.'); return; }
    setError('');
    setLoading(true);
    try {
      const family = await accountUseCases.signIn.execute(email.trim(), password);
      setFamily(family);
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <AuthHero subtitle="Rutinas, historias y palabras para cada día." />

          <View style={s.card}>
            <Text style={s.title}>Hola de nuevo</Text>
            <Text style={s.subtitle}>Inicia sesión para ver la rutina y las historias.</Text>

            {FEATURES.socialSignIn && (
              <>
                <TouchableOpacity style={s.appleBtn}>
                  <MaterialCommunityIcons name="apple" size={20} color="#fff" />
                  <Text style={s.appleBtnText}>Continuar con Apple</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.googleBtn}>
                  <MaterialCommunityIcons name="google" size={18} color="#4285F4" />
                  <Text style={s.googleBtnText}>Continuar con Google</Text>
                </TouchableOpacity>
                <View style={s.divider}>
                  <View style={s.dividerLine} />
                  <Text style={s.dividerText}>o con tu correo</Text>
                  <View style={s.dividerLine} />
                </View>
              </>
            )}

            <AuthField
              label="Correo"
              icon="email-outline"
              value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              placeholder="tucorreo@ejemplo.com"
            />
            <AuthField
              label="Contraseña"
              icon="lock-outline"
              password
              labelAction={{ text: '¿Olvidaste tu contraseña?', onPress: handleForgot }}
              value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              placeholder="Tu contraseña"
            />

            {error ? (
              <View style={s.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={DANGER} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.primaryBtn, loading && s.disabledBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.primaryBtnText}>Iniciar sesión</Text>}
            </TouchableOpacity>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>¿Primera vez en MatyVoz?</Text>
            <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('Register')}>
              <Text style={s.secondaryBtnText}>Crear una cuenta</Text>
            </TouchableOpacity>
          </View>

          <View style={s.flex} />

          <View style={s.legal}>
            <Text style={s.legalLink} onPress={() => Linking.openURL(LEGAL.privacyUrl)}>Privacidad</Text>
            <Text style={s.legalDot}>·</Text>
            <Text style={s.legalLink} onPress={() => Linking.openURL(LEGAL.termsUrl)}>Términos</Text>
            <Text style={s.legalDot}>·</Text>
            <Text style={s.legalLink} onPress={() => Linking.openURL(LEGAL.supportUrl)}>Ayuda</Text>
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
    marginHorizontal: 16, marginTop: -36,
    borderRadius: 24, padding: 22,
    shadowColor: '#1d2a36', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 6,
  },
  title: { fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', color: INK, letterSpacing: -0.3 },
  subtitle: { fontFamily: FONT_BODY, fontSize: 14, color: INK3, marginTop: 4, marginBottom: 20, lineHeight: 20 },

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

  footer: { alignItems: 'center', marginTop: 24, paddingHorizontal: 16 },
  footerText: { fontFamily: FONT_BODY, fontSize: 14, color: INK3, fontWeight: '600', marginBottom: 10 },
  secondaryBtn: {
    alignSelf: 'stretch', height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontFamily: FONT_DISP, color: ACCENT, fontWeight: '800', fontSize: 15 },

  legal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 20 },
  legalLink: { fontFamily: FONT_BODY, fontSize: 12, color: INK3, fontWeight: '600' },
  legalDot: { fontSize: 12, color: INK3 },
}));
