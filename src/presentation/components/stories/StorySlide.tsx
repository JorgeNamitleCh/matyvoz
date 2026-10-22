import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { StoryStep } from '../../../core/domain/entities';
import { useTheme } from '../../../infrastructure/theme';

interface Props {
  step: StoryStep;
  childMode?: boolean;
  onNext?: () => void;
}

const { width } = Dimensions.get('window');

export default function StorySlide({ step, childMode = false, onNext }: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const bg = childMode ? '#000000' : colors.surface;
  const textColor = childMode ? colors.textOnDark : colors.textPrimary;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onNext} style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
      <View style={{ width: width - spacing.xl * 2, aspectRatio: 1, backgroundColor: childMode ? '#1a1a1a' : colors.surfaceAlt, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
        <Text style={{ color: '#555', fontSize: typography.fontSizeMD, letterSpacing: 1 }}>
          {step.mediaType === 'pictogram' ? step.pictogramKey : 'FOTO'}
        </Text>
      </View>
      <Text style={{ fontSize: childMode ? typography.fontSizeChildTitle : typography.fontSizeLG, fontWeight: typography.fontWeightBold, color: textColor, textAlign: 'center', marginBottom: spacing.md }}>
        {step.text}
      </Text>
      {step.supportPictograms.length > 0 && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {step.supportPictograms.map((pic, i) => (
            <View key={i} style={{ width: 56, height: 56, backgroundColor: colors.secondary, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 26 }}>👤</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}
