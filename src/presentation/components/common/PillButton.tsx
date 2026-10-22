import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined';
  loading?: boolean;
  disabled?: boolean;
}

export default function PillButton({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const bg = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : 'transparent';
  const textColor = variant === 'outlined' ? colors.primary : colors.textOnDark;
  const border = variant === 'outlined' ? { borderWidth: 1.5, borderColor: colors.primary } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[{ backgroundColor: bg, borderRadius: borderRadius.pill, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' }, border, disabled && { opacity: 0.5 }]}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={{ color: textColor, fontWeight: typography.fontWeightBold, fontSize: typography.fontSizeMD }}>{label}</Text>
      }
    </TouchableOpacity>
  );
}
