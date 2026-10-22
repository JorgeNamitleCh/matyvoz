import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';
import { AuthScreenProps } from '../../navigation/types';
import { Neurodivergence, CommunicationType, Sensitivity } from '../../../core/domain/entities';

type Props = AuthScreenProps<'ChildProfile'>;

const NEUROS: { key: Neurodivergence; label: string; desc: string; emoji: string }[] = [
  { key: 'ASD', label: 'TEA', desc: 'Espectro autista', emoji: '🧩' },
  { key: 'ADHD', label: 'TDAH', desc: 'Atención', emoji: '⚡' },
  { key: 'SLD', label: 'TEL', desc: 'Lenguaje', emoji: '💬' },
  { key: 'DS', label: 'SD', desc: 'Down', emoji: '💙' },
  { key: 'other', label: 'Otra', desc: 'Otra condición', emoji: '❓' },
];

const COMMUNICATIONS: { key: CommunicationType; label: string }[] = [
  { key: 'verbal', label: 'Verbal' },
  { key: 'mixed', label: 'Mixta' },
  { key: 'nonverbal', label: 'No verbal' },
];

const SENSITIVITIES: { key: Sensitivity; label: string }[] = [
  { key: 'sounds', label: 'Sonidos' },
  { key: 'lights', label: 'Luces' },
  { key: 'textures', label: 'Texturas' },
  { key: 'crowds', label: 'Multitud' },
  { key: 'changes', label: 'Cambios' },
];

export default function ChildProfileScreen({ navigation }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [selectedNeuros, setSelectedNeuros] = useState<Neurodivergence[]>([]);
  const [communication, setCommunication] = useState<CommunicationType>('mixed');
  const [sensitivities, setSensitivities] = useState<Sensitivity[]>([]);

  const toggleNeuro = (key: Neurodivergence) => setSelectedNeuros(prev => prev.includes(key) ? prev.filter(n => n !== key) : [...prev, key]);
  const toggleSensitivity = (key: Sensitivity) => setSensitivities(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, padding: spacing.lg },
    stepBadge: { backgroundColor: colors.accentPurple, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.pill, alignSelf: 'flex-start', marginBottom: spacing.md },
    stepText: { fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightBold, color: colors.textPrimary, letterSpacing: 0.8 },
    title: { fontSize: typography.fontSizeXL, fontWeight: typography.fontWeightBold, color: colors.textPrimary, marginBottom: spacing.xs },
    subtitle: { fontSize: typography.fontSizeSM, color: colors.textSecondary, marginBottom: spacing.xl },
    sectionLabel: { fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightSemiBold, color: colors.textSecondary, marginBottom: spacing.sm, letterSpacing: 0.8 },
    hint: { fontSize: typography.fontSizeXS, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
    neuroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
    neuroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.sm, borderWidth: 2, borderColor: colors.border, flex: 1, minWidth: '45%' },
    neuroCardActive: { borderColor: colors.primary },
    neuroEmoji: { fontSize: 22, marginRight: spacing.sm },
    neuroLabel: { fontSize: typography.fontSizeMD, fontWeight: typography.fontWeightSemiBold, color: colors.textPrimary },
    neuroDesc: { fontSize: typography.fontSizeXS, color: colors.textSecondary },
    commRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    commBtn: { flex: 1, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
    commBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    commText: { fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightMedium, color: colors.textPrimary },
    commTextActive: { color: colors.textOnDark, fontWeight: typography.fontWeightBold },
    sensRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    sensChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    sensChipActive: { backgroundColor: colors.accentBlue, borderColor: colors.accentBlue },
    sensText: { fontSize: typography.fontSizeSM, color: colors.textPrimary },
    sensTextActive: { color: colors.textOnDark, fontWeight: typography.fontWeightSemiBold },
    footer: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.lg },
    backBtn: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border },
    continueBtn: { flex: 1, marginLeft: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center' },
    continueBtnText: { color: colors.textOnDark, fontWeight: typography.fontWeightBold, fontSize: typography.fontSizeMD },
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.stepBadge}><Text style={s.stepText}>PASO 3 · PERFIL</Text></View>
        <Text style={s.title}>Cuéntanos un poco más</Text>
        <Text style={s.subtitle}>Esto adapta el ritmo de las historias y el tipo de apoyo visual. Puedes cambiarlo cuando quieras.</Text>

        <Text style={s.sectionLabel}>NEURODIVERGENCIA</Text>
        <View style={s.neuroGrid}>
          {NEUROS.map(n => (
            <TouchableOpacity key={n.key} style={[s.neuroCard, selectedNeuros.includes(n.key) && s.neuroCardActive]} onPress={() => toggleNeuro(n.key)}>
              <Text style={s.neuroEmoji}>{n.emoji}</Text>
              <View>
                <Text style={s.neuroLabel}>{n.label}</Text>
                <Text style={s.neuroDesc}>{n.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.hint}>Puedes marcar más de una.</Text>

        <Text style={s.sectionLabel}>COMUNICACIÓN</Text>
        <View style={s.commRow}>
          {COMMUNICATIONS.map(c => (
            <TouchableOpacity key={c.key} style={[s.commBtn, communication === c.key && s.commBtnActive]} onPress={() => setCommunication(c.key)}>
              <Text style={[s.commText, communication === c.key && s.commTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>SENSIBILIDADES (OPCIONAL)</Text>
        <View style={s.sensRow}>
          {SENSITIVITIES.map(s2 => (
            <TouchableOpacity key={s2.key} style={[s.sensChip, sensitivities.includes(s2.key) && s.sensChipActive]} onPress={() => toggleSensitivity(s2.key)}>
              <Text style={[s.sensText, sensitivities.includes(s2.key) && s.sensTextActive]}>
                {sensitivities.includes(s2.key) ? '✓ ' : ''}{s2.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}><Text>←</Text></TouchableOpacity>
        <TouchableOpacity style={s.continueBtn}>
          <Text style={s.continueBtnText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
