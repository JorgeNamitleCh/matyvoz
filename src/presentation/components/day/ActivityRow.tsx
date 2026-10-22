import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';
import { Activity } from '../../../core/domain/entities';

interface Props {
  activity: Activity;
  onComplete?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  routines: '#8B6BB1',
  hygiene: '#4CAF7D',
  places: '#C8A8E9',
  social: '#5BB8D4',
  food: '#F4884A',
};

const CATEGORY_LABELS: Record<string, string> = {
  routines: 'TIEMPO',
  hygiene: 'ACCIÓN',
  places: 'LUGAR',
  social: 'SOCIAL',
  food: 'COMIDA',
};

const ICON_MAP: Record<string, string> = {
  despertar: '☀️', desayuno: '🥣', comer: '🍽️', dormir: '😴',
  bañarse: '🛁', cepillarse: '🪥', vestirse: '👕', leer: '📖',
  parque: '🌳', cole: '🏫', casa: '🏠', dentista: '🦷', default: '📋',
};

export default function ActivityRow({ activity, onComplete }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const catColor = CATEGORY_COLORS[activity.category] ?? colors.primaryLight;
  const catLabel = CATEGORY_LABELS[activity.category] ?? '';
  const emoji = ICON_MAP[activity.iconKey] ?? ICON_MAP.default;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.lg }}>
      <Text style={{ fontSize: typography.fontSizeSM, color: colors.textSecondary, width: 40 }}>{activity.hour}</Text>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: activity.isCompleted ? colors.surfaceAlt : colors.surface, borderRadius: borderRadius.lg, padding: spacing.sm, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: catColor, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm }}>
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 }}>
            <View style={{ backgroundColor: catColor + '30', borderRadius: borderRadius.pill, paddingHorizontal: spacing.xs, paddingVertical: 1 }}>
              <Text style={{ fontSize: 9, fontWeight: typography.fontWeightBold, color: catColor, letterSpacing: 0.8 }}>{catLabel}</Text>
            </View>
          </View>
          <Text style={{ fontSize: typography.fontSizeMD, fontWeight: typography.fontWeightSemiBold, color: activity.isCompleted ? colors.textSecondary : colors.textPrimary, textDecorationLine: activity.isCompleted ? 'line-through' : 'none' }}>
            {activity.name}
          </Text>
        </View>
        {!activity.isCompleted && onComplete && (
          <TouchableOpacity onPress={onComplete} style={{ backgroundColor: colors.primary, borderRadius: borderRadius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 }}>
            <Text style={{ color: colors.textOnDark, fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightBold }}>AHORA</Text>
          </TouchableOpacity>
        )}
        {activity.isCompleted && (
          <Text style={{ color: colors.success, fontSize: 18 }}>✓</Text>
        )}
      </View>
    </View>
  );
}
