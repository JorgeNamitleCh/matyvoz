import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';
import { Child } from '../../../core/domain/entities';

interface Props {
  child: Child;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 36, md: 52, lg: 72 };

export default function ChildAvatar({ child, size = 'md' }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const dim = SIZES[size];

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: dim, height: dim, borderRadius: dim / 2, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs }}>
        <Text style={{ fontSize: dim * 0.45 }}>👦</Text>
      </View>
      <Text style={{ fontSize: typography.fontSizeSM, fontWeight: typography.fontWeightSemiBold, color: colors.textPrimary }}>{child.name}</Text>
      <Text style={{ fontSize: typography.fontSizeXS, color: colors.textSecondary }}>{child.age} años</Text>
    </View>
  );
}
