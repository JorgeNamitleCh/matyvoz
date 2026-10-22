import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/types';
import { useAuthStore } from '../../stores/useAuthStore';
import { initials } from '../../utils/profileOptions';
import { PRIMARY, FONT_DISP, themedStyles } from '../../theme/tokens';

/** Círculo con las iniciales de la cuenta: abre "Mi perfil". */
export default function ProfileButton() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const name = useAuthStore(s => s.family?.name ?? '');

  return (
    <TouchableOpacity
      style={s.btn}
      onPress={() => navigation.navigate('Profile')}
      accessibilityLabel="Mi perfil"
    >
      <Text style={s.text}>{initials(name)}</Text>
    </TouchableOpacity>
  );
}

const s = themedStyles(() => ({
  btn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  text: { fontFamily: FONT_DISP, fontSize: 15, fontWeight: '800', color: '#fff' },
}));
