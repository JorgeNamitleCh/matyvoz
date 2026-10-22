import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SURFACE, INK, BORDER, FONT_DISP, themedStyles } from '../../theme/tokens';

interface Props {
  title: string;
  onBack: () => void;
}

/** Encabezado con botón ← (mismo estilo que "Crear cuenta"). */
export default function ScreenHeader({ title, onBack }: Props) {
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.backBtn} onPress={onBack} accessibilityLabel="Volver">
        <MaterialCommunityIcons name="arrow-left" size={20} color={INK} />
      </TouchableOpacity>
      <Text style={s.title}>{title}</Text>
    </View>
  );
}

const s = themedStyles(() => ({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 4, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  title: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 15, color: INK },
}));
