import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/useAuthStore';
import { FirebaseAuthRepository } from '../../../data/repositories/FirebaseAuthRepository';
import { SignInWithEmailUseCase } from '../../../core/domain/usecases/auth/SignInWithEmailUseCase';
import { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'Login'>;

const authRepo = new FirebaseAuthRepository();
const signInUseCase = new SignInWithEmailUseCase(authRepo);

const BG = '#EFEEEA';
const INK = '#2D2620';
const ACCENT = '#2A5F8F';
const BORDER = 'rgba(0,0,0,0.08)';
const INK3 = '#8a8a8a';
const FONT_DISP = 'Nunito ExtraLight';
const FONT_BODY = 'Atkinson Hyperlegible';

export default function LoginScreen({ navigation }: Props) {
  const setFamily = useAuthStore(s => s.setFamily);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Completa todos los campos.'); return; }
    setError('');
    setLoading(true);
    try {
      const family = await signInUseCase.execute(email.trim(), password);
      setFamily(family);
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo + nombre de app */}
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Text style={s.logoEmoji}>📖</Text>
            </View>
            <View>
              <Text style={s.appName}>MatyVoz</Text>
              <Text style={s.appTagline}>Historias sociales para tu peque</Text>
            </View>
          </View>

          {/* Título */}
          <View style={s.titleBlock}>
            <Text style={s.title}>Hola de nuevo</Text>
            <Text style={s.subtitle}>Inicia sesión para ver las historias y la rutina del día.</Text>
          </View>

          {/* SSO */}
          <TouchableOpacity style={s.appleBtn}>
            <Text style={s.appleBtnIcon}></Text>
            <Text style={s.appleBtnText}>Continuar con Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.googleBtn}>
            <Text style={s.googleG}>G</Text>
            <Text style={s.googleBtnText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Separador */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>O CON CORREO</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Correo */}
          <Text style={s.label}>CORREO</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="marta@familia.com"
            placeholderTextColor={INK3}
          />

          {/* Contraseña */}
          <View style={s.labelRow}>
            <Text style={s.label}>CONTRASEÑA</Text>
            <TouchableOpacity>
              <Text style={s.forgot}>¿Olvidaste?</Text>
            </TouchableOpacity>
          </View>
          <View style={s.passwordWrap}>
            <TextInput
              style={s.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={INK3}
            />
            <TouchableOpacity style={s.showBtn} onPress={() => setShowPassword(v => !v)}>
              <Text style={s.showBtnText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {/* Botón principal */}
          <TouchableOpacity style={s.primaryBtn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryBtnText}>Iniciar sesión</Text>}
          </TouchableOpacity>

          <View style={{ flex: 1, minHeight: 16 }} />

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>¿Sin cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={s.footerLink}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 32, paddingBottom: 22 },

  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  logoBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#E8F5E9', borderWidth: 3, borderColor: '#388E3C',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  logoEmoji: { fontSize: 28 },
  appName: { fontFamily: FONT_DISP, fontSize: 22, fontWeight: '800', lineHeight: 22, color: INK },
  appTagline: { fontFamily: FONT_BODY, fontSize: 12, color: INK3, fontWeight: '600', marginTop: 2 },

  titleBlock: { marginBottom: 22 },
  title: { fontFamily: FONT_DISP, fontSize: 28, fontWeight: '800', lineHeight: 31, color: INK },
  subtitle: { fontFamily: FONT_BODY, fontSize: 14, color: INK3, marginTop: 6, lineHeight: 20 },

  appleBtn: {
    height: 56, borderRadius: 14, backgroundColor: '#000',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  appleBtnIcon: { color: '#fff', fontSize: 18, marginRight: 10 },
  appleBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 16 },

  googleBtn: {
    height: 56, borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: BORDER,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 0,
  },
  googleG: { fontSize: 16, fontWeight: '700', color: '#4285F4', marginRight: 10 },
  googleBtnText: { fontFamily: FONT_DISP, color: INK, fontWeight: '800', fontSize: 16 },

  divider: { flexDirection: 'row', alignItems: 'center', paddingTop: 20, paddingBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontFamily: FONT_BODY, marginHorizontal: 10, fontSize: 11, fontWeight: '800', letterSpacing: 1, color: INK3 },

  label: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    fontFamily: FONT_BODY,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: BORDER,
    fontSize: 15, fontWeight: '600', color: INK,
    marginBottom: 10,
  },

  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgot: { fontFamily: FONT_BODY, fontSize: 11, color: ACCENT, fontWeight: '700' },

  passwordWrap: { marginBottom: 10 },
  passwordInput: {
    fontFamily: FONT_BODY,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, paddingRight: 80,
    borderWidth: 1.5, borderColor: BORDER,
    fontSize: 18, fontWeight: '700', letterSpacing: 4, color: INK,
  },
  showBtn: { position: 'absolute', right: 16, top: 14 },
  showBtnText: { fontFamily: FONT_BODY, fontSize: 12, color: INK3, fontWeight: '700' },

  error: { fontFamily: FONT_BODY, color: '#D32F2F', fontSize: 13, marginBottom: 8 },

  primaryBtn: {
    height: 56, borderRadius: 14, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  primaryBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 16 },

  footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 18, paddingBottom: 4 },
  footerText: { fontFamily: FONT_BODY, fontSize: 14, color: INK3, fontWeight: '600' },
  footerLink: { fontFamily: FONT_BODY, fontSize: 14, color: ACCENT, fontWeight: '800' },
});
