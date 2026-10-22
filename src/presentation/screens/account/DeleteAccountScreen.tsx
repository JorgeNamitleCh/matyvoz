import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChildStore } from '../../stores/useChildStore';
import { useDialog } from '../../providers/DialogProvider';
import ScreenHeader from '../../components/common/ScreenHeader';
import { accountUseCases } from '../../../infrastructure/di/container';
import { RecentLoginRequiredError } from '../../../core/errors/AppError';
import { BG, SURFACE, INK, INK2, INK3, BORDER, DANGER, DANGER_BG, DANGER_FILL, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

type Props = RootScreenProps<'DeleteAccount'>;


const PROVIDER_NAME = { google: 'Google', apple: 'Apple', other: 'tu proveedor' } as const;

function friendlyError(e: any): string {
  const msg = String(e?.message ?? '') + String(e?.cause?.code ?? '');
  if (/wrong-password|invalid-credential|invalid-login/.test(msg)) return 'La contraseña no es correcta.';
  if (/too-many-requests/.test(msg)) return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
  if (/network/.test(msg)) return 'Sin conexión. Revisa tu internet y vuelve a intentarlo.';
  return e?.message || 'No se pudo eliminar la cuenta. Inténtalo de nuevo.';
}

export default function DeleteAccountScreen({ navigation }: Props) {
  const email = useAuthStore(s => s.family?.email);
  const childName = useChildStore(s => s.currentChild?.name);
  const { showDialog } = useDialog();
  const method = accountUseCases.getSignInMethod.execute();
  const usesPassword = method === 'password';
  const providerName = method && method !== 'password' ? PROVIDER_NAME[method] : '';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const items = [
    { icon: 'account-outline', text: `Tu cuenta${email ? ` (${email})` : ''}` },
    { icon: 'account-child-outline', text: childName ? `El perfil de ${childName}` : 'El perfil de tu peque' },
    { icon: 'calendar-check-outline', text: 'Actividades de Mi día y tu catálogo' },
    { icon: 'book-open-page-variant-outline', text: 'Historias sociales' },
    { icon: 'message-text-outline', text: 'Palabras y frases' },
  ];

  async function doDelete() {
    setError('');
    setDeleting(true);
    try {
      await accountUseCases.deleteAccount.execute(usesPassword ? password : undefined);
      // Al borrar el usuario, useAuth detecta la sesión cerrada y vuelve al login.
      showDialog({
        title: 'Cuenta eliminada',
        message: 'Borramos tu cuenta y todos sus datos. Gracias por haber usado MatyVoz.',
      });
    } catch (e: any) {
      setDeleting(false);
      if (e instanceof RecentLoginRequiredError) {
        showDialog({
          title: 'Vuelve a iniciar sesión',
          message: `Por seguridad, ${providerName || 'tu proveedor'} pide un inicio de sesión reciente para eliminar la cuenta. Cierra sesión, entra de nuevo y vuelve a esta pantalla. No se borró nada.`,
          buttons: [
            { text: 'Ahora no', style: 'cancel' },
            { text: 'Cerrar sesión', onPress: () => accountUseCases.signOut.execute() },
          ],
        });
        return;
      }
      setError(friendlyError(e));
    }
  }

  function confirmDelete() {
    if (usesPassword && !password) {
      setError('Escribe tu contraseña para confirmar.');
      return;
    }
    showDialog({
      title: '¿Eliminar para siempre?',
      message: 'No podrás recuperar tu cuenta ni tus datos.',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ],
    });
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title="Eliminar cuenta" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.iconCircle}>
            <MaterialCommunityIcons name="account-remove-outline" size={34} color={DANGER} />
          </View>
          <Text style={s.title}>Eliminar tu cuenta</Text>
          <Text style={s.subtitle}>
            Se borra para siempre todo lo que guardaste en MatyVoz. Esta acción no se puede deshacer.
          </Text>

          <Text style={s.label}>SE BORRARÁ</Text>
          <View style={s.card}>
            {items.map((it, i) => (
              <View key={it.text} style={[s.itemRow, i < items.length - 1 && s.itemGap]}>
                <MaterialCommunityIcons name={it.icon} size={20} color={DANGER} />
                <Text style={s.itemText}>{it.text}</Text>
              </View>
            ))}
          </View>
          <Text style={s.note}>
            Las grabaciones de voz de las historias se guardan solo en este teléfono y se borran al desinstalar la app.
          </Text>

          {usesPassword ? (
            <>
              <Text style={s.label}>ESCRIBE TU CONTRASEÑA PARA CONFIRMAR</Text>
              <View style={s.passwordWrap}>
                <TextInput
                  style={s.passwordInput}
                  value={password}
                  onChangeText={v => { setPassword(v); setError(''); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="••••••••"
                  placeholderTextColor={INK3}
                />
                <TouchableOpacity style={s.showBtn} onPress={() => setShowPassword(v => !v)}>
                  <Text style={s.showBtnText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={s.providerCard}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={INK} />
              <Text style={s.providerText}>
                Entraste con {providerName}. Si tu sesión no es reciente, te pediremos volver a iniciar sesión antes de borrar nada.
              </Text>
            </View>
          )}

          {error ? <Text style={s.error}>{error}</Text> : null}
        </ScrollView>

        <View style={s.bottom}>
          <TouchableOpacity
            style={[s.dangerBtn, deleting && s.disabledBtn]}
            onPress={confirmDelete}
            disabled={deleting}
          >
            {deleting
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.dangerBtnText}>Eliminar mi cuenta</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} disabled={deleting}>
            <Text style={s.cancelBtnText}>Cancelar</Text>
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

  iconCircle: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: DANGER_BG,
    alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 12,
  },
  title: { fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', lineHeight: 29, color: INK },
  subtitle: { fontFamily: FONT_BODY, fontSize: 13, color: INK3, marginTop: 6, lineHeight: 18, marginBottom: 18 },

  label: { fontFamily: FONT_BODY, fontSize: 10, color: INK3, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },

  card: {
    backgroundColor: DANGER_BG, borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: 'rgba(178,59,59,0.25)',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemGap: { marginBottom: 10 },
  itemText: { flex: 1, fontFamily: FONT_BODY, fontSize: 13, fontWeight: '700', color: INK2 },
  note: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '600', lineHeight: 16, marginTop: 8, marginBottom: 18 },

  passwordWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURFACE, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1, fontFamily: FONT_DISP, fontSize: 16, fontWeight: '700', color: INK,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  showBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  showBtnText: { fontFamily: FONT_BODY, fontSize: 12, fontWeight: '800', color: INK3 },

  providerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: SURFACE, borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: BORDER, marginBottom: 10,
  },
  providerText: { flex: 1, fontFamily: FONT_BODY, fontSize: 12, fontWeight: '600', color: INK2, lineHeight: 17 },

  error: { fontFamily: FONT_BODY, color: DANGER, fontSize: 13, marginBottom: 8 },

  bottom: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 12, gap: 10 },
  dangerBtn: {
    height: 56, borderRadius: 14, backgroundColor: DANGER_FILL,
    alignItems: 'center', justifyContent: 'center',
  },
  disabledBtn: { opacity: 0.5 },
  dangerBtnText: { fontFamily: FONT_DISP, color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn: {
    height: 52, borderRadius: 14, backgroundColor: SURFACE,
    borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontFamily: FONT_DISP, color: INK, fontWeight: '800', fontSize: 15 },
}));
