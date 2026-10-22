import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/useAuthStore';
import { useChildStore } from '../../stores/useChildStore';
import { useDialog } from '../../providers/DialogProvider';
import ScreenHeader from '../../components/common/ScreenHeader';
import { accountUseCases } from '../../../infrastructure/di/container';
import { LEGAL } from '../../../infrastructure/config/legal';
import {
  COMMUNICATIONS, NEUROS, SENSITIVITIES, SUPPORTS, initials, labelOf,
} from '../../utils/profileOptions';
import { BG, SURFACE, INK, INK2, INK3, BORDER, LINE_STRONG, PRIMARY, DANGER, DANGER_BG, DANGER_FILL, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

type Props = RootScreenProps<'Profile'>;

const PERSONA_BG = '#FFE66B';
const PERSONA_STROKE = '#1f1a0a';

export default function ProfileScreen({ navigation }: Props) {
  const family = useAuthStore(s => s.family);
  const child = useChildStore(s => s.currentChild);
  const { showDialog } = useDialog();

  const isAdult = child?.profileType === 'adult';

  async function openUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      showDialog({ title: 'No se pudo abrir', message: url });
    }
  }

  function confirmSignOut() {
    showDialog({
      title: '¿Cerrar sesión?',
      message: 'Tus datos se quedan guardados en tu cuenta. Puedes volver a entrar cuando quieras.',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', onPress: () => accountUseCases.signOut.execute() },
      ],
    });
  }

  const legalRows = [
    { icon: 'shield-account-outline', label: 'Aviso de privacidad', onPress: () => openUrl(LEGAL.privacyUrl) },
    { icon: 'file-document-outline', label: 'Términos y condiciones', onPress: () => openUrl(LEGAL.termsUrl) },
    {
      icon: 'email-outline',
      label: 'Contacto y soporte',
      onPress: () => openUrl(`mailto:${LEGAL.supportEmail}?subject=${encodeURIComponent('Ayuda con MatyVoz')}`),
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Mi perfil" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Familia / persona adulta con la cuenta */}
        <Text style={s.sectionLabel}>TU CUENTA</Text>
        <View style={s.card}>
          <View style={s.cardRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials(family?.name ?? '')}</Text>
            </View>
            <View style={s.flex}>
              <Text style={s.name} numberOfLines={1}>{family?.name ?? '—'}</Text>
              {!!family?.role && <Text style={s.meta}>{family.role}</Text>}
              <Text style={s.meta} numberOfLines={1}>{family?.email}</Text>
            </View>
            <TouchableOpacity
              style={s.editBtn}
              onPress={() => navigation.navigate('EditFamily')}
              accessibilityLabel="Editar tu cuenta"
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={INK} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Persona que acompaña MatyVoz */}
        <Text style={s.sectionLabel}>{isAdult ? 'PERFIL' : 'TU PEQUE'}</Text>
        {child ? (
          <View style={s.card}>
            <View style={s.cardRow}>
              <View style={s.personIcon}>
                <MaterialCommunityIcons
                  name={isAdult ? 'account-outline' : 'account-child-outline'}
                  size={28}
                  color={PERSONA_STROKE}
                />
              </View>
              <View style={s.flex}>
                <Text style={s.name} numberOfLines={1}>{child.name}</Text>
                <Text style={s.meta}>
                  {child.age} {child.age === 1 ? 'año' : 'años'} · {isAdult ? 'Persona adulta' : 'Niño/a'}
                </Text>
              </View>
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => navigation.navigate('EditPerson')}
                accessibilityLabel="Editar perfil"
              >
                <MaterialCommunityIcons name="pencil-outline" size={18} color={INK} />
              </TouchableOpacity>
            </View>

            <View style={s.divider} />

            <InfoRow label="Condición">
              {child.neurodivergence.length > 0 ? (
                <View style={s.tags}>
                  {child.neurodivergence.map(n => (
                    <View key={n} style={s.tag}>
                      <Text style={s.tagText}>{labelOf(NEUROS, n)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={s.infoValue}>Sin indicar</Text>
              )}
            </InfoRow>
            <InfoRow label="Comunicación">
              <Text style={s.infoValue}>{labelOf(COMMUNICATIONS, child.communicationType)}</Text>
            </InfoRow>
            <InfoRow label="Sensibilidades">
              <Text style={s.infoValue}>
                {child.sensitivities.length > 0
                  ? child.sensitivities.map(k => labelOf(SENSITIVITIES, k)).join(', ')
                  : 'Ninguna'}
              </Text>
            </InfoRow>
            <InfoRow label="Apoyo visual">
              <Text style={s.infoValue}>{labelOf(SUPPORTS, child.supportType)}</Text>
            </InfoRow>
            <InfoRow label="Animaciones mínimas" last>
              <Text style={s.infoValue}>{child.minimalAnimations ? 'Sí' : 'No'}</Text>
            </InfoRow>
          </View>
        ) : (
          <TouchableOpacity style={s.emptyCard} onPress={() => navigation.navigate('EditPerson')}>
            <View style={s.personIcon}>
              <MaterialCommunityIcons name="account-plus-outline" size={28} color={PERSONA_STROKE} />
            </View>
            <View style={s.flex}>
              <Text style={s.name}>Agrega su perfil</Text>
              <Text style={s.meta}>
                Cuéntanos a quién acompaña MatyVoz: un niño/a o una persona adulta.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={INK3} />
          </TouchableOpacity>
        )}

        {/* Legal y ayuda */}
        <Text style={s.sectionLabel}>LEGAL Y AYUDA</Text>
        <View style={s.listCard}>
          {legalRows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              style={[s.listRow, i < legalRows.length - 1 && s.listRowBorder]}
              onPress={row.onPress}
            >
              <View style={s.listIcon}>
                <MaterialCommunityIcons name={row.icon} size={20} color={INK} />
              </View>
              <Text style={s.listLabel}>{row.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={INK3} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sesión */}
        <TouchableOpacity style={s.signOutBtn} onPress={confirmSignOut}>
          <MaterialCommunityIcons name="logout" size={20} color={INK} />
          <Text style={s.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* Zona de peligro */}
        <TouchableOpacity style={s.dangerCard} onPress={() => navigation.navigate('DeleteAccount')}>
          <View style={s.dangerIcon}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
          </View>
          <View style={s.flex}>
            <Text style={s.dangerTitle}>Eliminar cuenta</Text>
            <Text style={s.dangerText}>Borra tu cuenta y todos sus datos para siempre.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={DANGER} />
        </TouchableOpacity>

        <Text style={s.footer}>MatyVoz · Responsable: {LEGAL.responsible}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[s.infoRow, !last && s.infoRowGap]}>
      <Text style={s.infoLabel}>{label}</Text>
      <View style={s.infoRight}>{children}</View>
    </View>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 22, paddingBottom: 32 },
  flex: { flex: 1 },

  sectionLabel: {
    fontFamily: FONT_BODY, fontSize: 10, color: INK3, fontWeight: '800',
    letterSpacing: 0.5, marginTop: 18, marginBottom: 8,
  },

  card: {
    backgroundColor: SURFACE, borderRadius: 16, borderWidth: 1.5, borderColor: BORDER, padding: 14,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONT_DISP, fontSize: 18, fontWeight: '800', color: '#fff' },
  personIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: PERSONA_BG,
    borderWidth: 2, borderColor: PERSONA_STROKE,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontFamily: FONT_DISP, fontSize: 18, fontWeight: '800', color: INK },
  meta: { fontFamily: FONT_BODY, fontSize: 12, color: INK3, marginTop: 2, lineHeight: 17 },
  editBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: BG,
    borderWidth: 1.5, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },

  divider: { height: 1, backgroundColor: BORDER, marginVertical: 12 },

  infoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  infoRowGap: { marginBottom: 10 },
  infoLabel: { fontFamily: FONT_BODY, fontSize: 13, color: INK3, fontWeight: '600', paddingTop: 2 },
  infoRight: { flex: 1, alignItems: 'flex-end' },
  infoValue: { fontFamily: FONT_BODY, fontSize: 13, color: INK2, fontWeight: '700', textAlign: 'right' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  tag: { backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontFamily: FONT_DISP, fontSize: 12, fontWeight: '800', color: '#fff' },

  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: SURFACE, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: LINE_STRONG, borderStyle: 'dashed',
  },

  listCard: { backgroundColor: SURFACE, borderRadius: 16, borderWidth: 1.5, borderColor: BORDER, overflow: 'hidden' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  listIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center',
  },
  listLabel: { flex: 1, fontFamily: FONT_DISP, fontSize: 15, fontWeight: '800', color: INK },

  signOutBtn: {
    height: 52, borderRadius: 14, marginTop: 18,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  signOutText: { fontFamily: FONT_DISP, fontSize: 15, fontWeight: '800', color: INK },

  dangerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12,
    backgroundColor: DANGER_BG, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: 'rgba(178,59,59,0.25)',
  },
  dangerIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: DANGER_FILL,
    alignItems: 'center', justifyContent: 'center',
  },
  dangerTitle: { fontFamily: FONT_DISP, fontSize: 15, fontWeight: '800', color: DANGER },
  dangerText: { fontFamily: FONT_BODY, fontSize: 12, color: DANGER, marginTop: 2 },

  footer: {
    fontFamily: FONT_BODY, fontSize: 11, color: INK3, textAlign: 'center', marginTop: 20,
  },
}));
