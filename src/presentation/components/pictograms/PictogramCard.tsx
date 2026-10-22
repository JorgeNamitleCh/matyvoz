import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';

interface Props {
  iconKey: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onPress?: () => void;
}

const DIMS = { sm: 56, md: 80, lg: 108 };
const FONT = { sm: 24, md: 36, lg: 48 };
const LABEL = { sm: 10, md: 12, lg: 15 };

const ICON_MAP: Record<string, string> = {
  despertar: '☀️', desayuno: '🥣', comer: '🍽️', dormir: '😴',
  bañarse: '🛁', cepillarse: '🪥', vestirse: '👕', leer: '📖',
  parque: '🌳', cole: '🏫', casa: '🏠', dentista: '🦷',
};

export default function PictogramCard({ iconKey, label, size = 'md', color, onPress }: Props) {
  const { colors, borderRadius } = useTheme();
  const dim = DIMS[size];
  const bg = color ?? colors.accentPurple;
  const emoji = ICON_MAP[iconKey] ?? '🔣';

  const content = (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: dim, height: dim, borderRadius: borderRadius.lg, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: FONT[size] }}>{emoji}</Text>
      </View>
      <Text style={{ fontSize: LABEL[size], color: colors.textSecondary, textAlign: 'center' }}>{label}</Text>
    </View>
  );

  if (onPress) return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  return content;
}
