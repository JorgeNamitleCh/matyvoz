import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BG, SURFACE, INK, INK3, ACCENT, FONT_BODY, themedStyles } from '../../theme/tokens';

interface Props extends TextInputProps {
  label: string;
  icon: string;
  /** Campo de contraseña con botón de ojo para mostrar/ocultar. */
  password?: boolean;
  /** Texto o enlace a la derecha de la etiqueta (p. ej. "¿Olvidaste tu contraseña?"). */
  labelAction?: { text: string; onPress: () => void };
}

/** Campo de texto de las pantallas de acceso: ícono, borde de foco y ojo para contraseñas. */
export default function AuthField({ label, icon, password, labelAction, style, ...input }: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={s.wrap}>
      <View style={s.labelRow}>
        <Text style={s.label}>{label}</Text>
        {labelAction && (
          <TouchableOpacity onPress={labelAction.onPress} hitSlop={8}>
            <Text style={s.labelAction}>{labelAction.text}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[s.field, focused && s.fieldFocused]}>
        <MaterialCommunityIcons name={icon} size={20} color={focused ? ACCENT : INK3} />
        <TextInput
          {...input}
          style={[s.input, style]}
          placeholderTextColor={INK3}
          secureTextEntry={password && !visible}
          onFocus={e => { setFocused(true); input.onFocus?.(e); }}
          onBlur={e => { setFocused(false); input.onBlur?.(e); }}
        />
        {password && (
          <TouchableOpacity
            onPress={() => setVisible(v => !v)}
            hitSlop={10}
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <MaterialCommunityIcons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={INK3} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = themedStyles(() => ({
  wrap: { marginBottom: 14 },
  labelRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
    columnGap: 12, rowGap: 2, marginBottom: 6,
  },
  label: { fontFamily: FONT_BODY, fontSize: 12, color: INK, fontWeight: '700' },
  labelAction: { fontFamily: FONT_BODY, fontSize: 12, color: ACCENT, fontWeight: '700' },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 52, borderRadius: 14, paddingHorizontal: 14,
    backgroundColor: BG, borderWidth: 1.5, borderColor: 'transparent',
  },
  fieldFocused: { backgroundColor: SURFACE, borderColor: ACCENT },
  input: {
    flex: 1, height: '100%',
    fontFamily: FONT_BODY, fontSize: 15, fontWeight: '600', color: INK,
  },
}));
