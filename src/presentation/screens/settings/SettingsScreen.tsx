import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, SafeAreaView } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';
import { useChildStore } from '../../stores/useChildStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { FirebaseAuthRepository } from '../../../data/repositories/FirebaseAuthRepository';

const authRepo = new FirebaseAuthRepository();

export default function SettingsScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const currentChild = useChildStore(s => s.currentChild);
  const signOut = useAuthStore(s => s.signOut);

  const [mode, setMode] = useState<'child' | 'family'>('child');
  const [bigText, setBigText] = useState(true);
  const [showText, setShowText] = useState(true);
  const [animations, setAnimations] = useState(false);
  const [sounds, setSounds] = useState(true);

  const handleSignOut = async () => {
    await authRepo.signOut();
    signOut();
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    childCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    childAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    childAvatarText: { fontSize: 28 },
    childInfo: { flex: 1 },
    childName: { fontSize: typography.fontSizeLG, fontWeight: typography.fontWeightBold, color: colors.textPrimary },
    childMeta: { fontSize: typography.fontSizeSM, color: colors.textSecondary },
    childTags: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
    tag: { backgroundColor: colors.primary, borderRadius: borderRadius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
    tagText: { color: colors.textOnDark, fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightBold },
    editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    togglesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    toggleCard: { flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleCardIcon: { width: 32, height: 32, borderRadius: borderRadius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
    toggleLabel: { fontSize: typography.fontSizeSM, color: colors.textPrimary, flex: 1 },
    modeLabel: { fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightSemiBold, color: colors.textSecondary, letterSpacing: 0.8, marginBottom: spacing.sm },
    modeRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: 4, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
    modeBtn: { flex: 1, padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
    modeBtnActive: { backgroundColor: colors.primary },
    modeBtnText: { fontSize: typography.fontSizeMD, fontWeight: typography.fontWeightSemiBold, color: colors.textSecondary },
    modeBtnTextActive: { color: colors.textOnDark },
    menuItem: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    menuItemText: { fontSize: typography.fontSizeMD, color: colors.textPrimary },
    chevron: { color: colors.textSecondary },
    signOutBtn: { padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
    signOutText: { color: colors.error, fontSize: typography.fontSizeMD },
  });

  const toggleItems = [
    { label: 'Texto grande', value: bigText, onChange: setBigText, emoji: '📝', bg: colors.accent },
    { label: 'Animaciones', value: animations, onChange: setAnimations, emoji: '⏱', bg: colors.surfaceAlt },
    { label: 'Mostrar texto', value: showText, onChange: setShowText, emoji: '📖', bg: colors.primary },
    { label: 'Sonidos', value: sounds, onChange: setSounds, emoji: '😊', bg: colors.accentBlue },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={{ fontSize: typography.fontSizeXXL, fontWeight: typography.fontWeightBold, color: colors.textPrimary, marginBottom: spacing.lg }}>Ajustes</Text>

        <View style={s.childCard}>
          <View style={s.childAvatar}><Text style={s.childAvatarText}>👦</Text></View>
          <View style={s.childInfo}>
            <Text style={s.childName}>{currentChild?.name ?? 'Mateo'}</Text>
            <Text style={s.childMeta}>{currentChild?.age ?? 7} años · Apoyo: {currentChild?.supportType ?? 'pictogramas'}</Text>
            <View style={s.childTags}>
              <View style={s.tag}><Text style={s.tagText}>3-5</Text></View>
              <View style={s.tag}><Text style={s.tagText}>6-9</Text></View>
              <View style={s.tag}><Text style={s.tagText}>10+</Text></View>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn}><Text>✏️</Text></TouchableOpacity>
        </View>

        <View style={s.togglesGrid}>
          {toggleItems.map(item => (
            <View key={item.label} style={s.toggleCard}>
              <View style={[s.toggleCardIcon, { backgroundColor: item.bg }]}>
                <Text>{item.emoji}</Text>
              </View>
              <Text style={s.toggleLabel}>{item.label}</Text>
              <Switch value={item.value} onValueChange={item.onChange} trackColor={{ true: colors.primary }} thumbColor={colors.surface} />
            </View>
          ))}
        </View>

        <Text style={s.modeLabel}>MODO</Text>
        <View style={s.modeRow}>
          <TouchableOpacity style={[s.modeBtn, mode === 'child' && s.modeBtnActive]} onPress={() => setMode('child')}>
            <Text style={[s.modeBtnText, mode === 'child' && s.modeBtnTextActive]}>Niño</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.modeBtn, mode === 'family' && s.modeBtnActive]} onPress={() => setMode('family')}>
            <Text style={[s.modeBtnText, mode === 'family' && s.modeBtnTextActive]}>Familiar 🔒</Text>
          </TouchableOpacity>
        </View>

        {['Compartir con cuidador', 'Voz de lectura', 'Cuenta y copia de seguridad', 'Acerca de'].map(item => (
          <TouchableOpacity key={item} style={s.menuItem}>
            <Text style={s.menuItemText}>{item}</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
