import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';
import { AuthScreenProps } from '../../navigation/types';
import { SupportType } from '../../../core/domain/entities';

type Props = AuthScreenProps<'ChildData'>;

const SUPPORT_OPTIONS: { key: SupportType; label: string; emoji: string }[] = [
  { key: 'pictograms', label: 'Pictogramas', emoji: '🔣' },
  { key: 'realPhotos', label: 'Fotos reales', emoji: '🏠' },
  { key: 'both', label: 'Ambos', emoji: '💙' },
  { key: 'noImage', label: 'Sin imagen', emoji: '⏰' },
];

export default function ChildDataScreen({ navigation }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [name, setName] = useState('');
  const [support, setSupport] = useState<SupportType | null>(null);
  const [minimalAnimations, setMinimalAnimations] = useState(false);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, padding: spacing.lg },
    stepBadge: { backgroundColor: colors.secondary, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.pill, alignSelf: 'flex-start', marginBottom: spacing.md },
    stepText: { fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightBold, color: colors.textPrimary, letterSpacing: 0.8 },
    title: { fontSize: typography.fontSizeXXL, fontWeight: typography.fontWeightBold, color: colors.textPrimary, marginBottom: spacing.xl },
    label: { fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightSemiBold, color: colors.textSecondary, marginBottom: spacing.xs, letterSpacing: 0.8 },
    input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, fontSize: typography.fontSizeMD, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    option: { flex: 1, minWidth: '45%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', borderWidth: 2, borderColor: colors.border },
    optionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
    optionEmoji: { fontSize: 28, marginBottom: spacing.xs },
    optionLabel: { fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightSemiBold, color: colors.textPrimary, textAlign: 'center' },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg },
    toggleLabel: { fontSize: typography.fontSizeMD, color: colors.textPrimary },
    toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: minimalAnimations ? colors.primary : colors.border, justifyContent: 'center', padding: 2 },
    toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface, alignSelf: minimalAnimations ? 'flex-end' : 'flex-start' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md },
    backBtn: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border },
    continueBtn: { flex: 1, marginLeft: spacing.sm, backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center' },
    continueBtnText: { color: colors.textOnDark, fontWeight: typography.fontWeightBold, fontSize: typography.fontSizeMD },
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.stepBadge}><Text style={s.stepText}>PASO 2 · NIÑO/A</Text></View>
        <Text style={s.title}>¿Cómo es vuestro peque?</Text>

        <Text style={s.label}>NOMBRE</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Mateo" placeholderTextColor={colors.textSecondary} />

        <Text style={s.label}>APOYO PRINCIPAL</Text>
        <View style={s.grid}>
          {SUPPORT_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.key} style={[s.option, support === opt.key && s.optionActive]} onPress={() => setSupport(opt.key)}>
              <Text style={s.optionEmoji}>{opt.emoji}</Text>
              <Text style={s.optionLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>SOBREESTIMULACIÓN</Text>
        <TouchableOpacity style={s.toggleRow} onPress={() => setMinimalAnimations(v => !v)}>
          <Text style={s.toggleLabel}>Animaciones mínimas</Text>
          <View style={s.toggle}><View style={s.toggleKnob} /></View>
        </TouchableOpacity>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.continueBtn} onPress={() => navigation.navigate('ChildProfile')}>
          <Text style={s.continueBtnText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
