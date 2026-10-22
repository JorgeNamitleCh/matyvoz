import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BG, INK, INK3, BORDER, DANGER, FONT_DISP, FONT_BODY } from '../../theme/tokens';

export interface DialogButton {
  text: string;
  onPress?: () => void;
  /** 'cancel' = outlined neutro · 'destructive' = rojo (eliminar) · sin estilo = relleno oscuro (acción principal) */
  style?: 'default' | 'cancel' | 'destructive';
}

interface AppDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  onRequestClose: () => void;
}

/**
 * Diálogo modal propio de MatyVoz (reemplaza a Alert.alert / Modal genérico
 * de iOS-Android) — misma tipografía, colores y bordes redondeados que el
 * resto de la app. Se dispara con el hook useDialog() (DialogProvider).
 */
export default function AppDialog({ visible, title, message, buttons, onRequestClose }: AppDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onRequestClose} />
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          {!!message && <Text style={s.message}>{message}</Text>}

          <View style={s.buttonRow}>
            {buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.btn,
                  btn.style === 'cancel' && s.btnCancel,
                  btn.style === 'destructive' && s.btnDestructive,
                  (!btn.style || btn.style === 'default') && s.btnDefault,
                ]}
                onPress={btn.onPress}
              >
                <Text
                  style={[
                    s.btnText,
                    btn.style === 'cancel' ? s.btnTextCancel : s.btnTextOnDark,
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 360,
    backgroundColor: '#fff', borderRadius: 18, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16,
  },
  title: { fontFamily: FONT_DISP, fontSize: 18, fontWeight: '800', color: INK, marginBottom: 8 },
  message: { fontFamily: FONT_BODY, fontSize: 14, color: INK3, lineHeight: 20, marginBottom: 18 },

  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  btnCancel: { backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER },
  btnDefault: { backgroundColor: INK },
  btnDestructive: { backgroundColor: DANGER },
  btnText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 15 },
  btnTextCancel: { color: INK },
  btnTextOnDark: { color: '#fff' },
});
