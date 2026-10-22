import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../infrastructure/theme';
import PictogramCard from '../pictograms/PictogramCard';

interface Item {
  key: string;
  label: string;
  emoji: string;
}

interface Props {
  title: string;
  items: Item[];
  onSelectItem: (item: Item) => void;
  backgroundColor?: string;
}

const SECTION_COLORS: Record<string, string> = {
  RUTINAS: '#8B6BB1',
  'HIGIENE Y CUIDADO': '#4CAF7D',
  'A DÓNDE VOY': '#F4884A',
  'MOMENTO SOCIAL': '#5BB8D4',
};

export default function PECSCategorySection({ title, items, onSelectItem, backgroundColor }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const bg = backgroundColor ?? SECTION_COLORS[title] ?? colors.primaryLight;

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ backgroundColor: bg, paddingVertical: spacing.xs, paddingHorizontal: spacing.lg }}>
        <Text style={{ fontSize: typography.fontSizeXS, fontWeight: typography.fontWeightBold, color: colors.textPrimary, letterSpacing: 1.2 }}>{title}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md }}>
        {items.map(item => (
          <PictogramCard key={item.key} iconKey={item.key} label={item.label} size="sm" color={bg} onPress={() => onSelectItem(item)} />
        ))}
      </View>
    </View>
  );
}
