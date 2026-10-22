import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';

interface Panel {
  label: string;
  emoji: string;
  color: string;
  duration?: string;
}

interface Props {
  first: Panel;
  then: Panel;
}

export default function FirstThenBoard({ first, then }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const renderPanel = (panel: Panel, title: string) => (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightBold, color: colors.textSecondary, letterSpacing: 0.8, marginBottom: spacing.sm }}>{title}</Text>
      <View style={{ width: 72, height: 72, borderRadius: borderRadius.lg, backgroundColor: panel.color, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
        <Text style={{ fontSize: 36 }}>{panel.emoji}</Text>
      </View>
      <Text style={{ fontSize: typography.fontSizeLG, fontWeight: typography.fontWeightBold, color: colors.textPrimary }}>{panel.label}</Text>
      {panel.duration && <Text style={{ fontSize: typography.fontSizeSM, color: colors.textSecondary }}>{panel.duration}</Text>}
    </View>
  );

  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      {renderPanel(first, '1 · PRIMERO')}
      <View style={{ alignSelf: 'center' }}><Text style={{ fontSize: 24, color: colors.textSecondary }}>→</Text></View>
      {renderPanel(then, '2 · DESPUÉS')}
    </View>
  );
}
