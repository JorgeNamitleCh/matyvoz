import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { INK, INK3, BORDER, BG, ACCENT, FONT_DISP, FONT_BODY } from '../../theme/tokens';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

interface TimePickerModalProps {
  visible: boolean;
  /** Hora actual en formato "HH:MM". */
  value: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

/**
 * Selector de hora propio de MatyVoz — dos columnas (hora / minutos) con
 * el mismo look de la app, en vez del picker nativo tipo reloj de iOS o
 * el diálogo genérico de Android.
 */
export default function TimePickerModal({ visible, value, onConfirm, onClose }: TimePickerModalProps) {
  const [h, m] = value.split(':');
  const [selHour, setSelHour] = useState(h ?? '17');
  const [selMinute, setSelMinute] = useState(m ?? '00');

  // Reinicia la selección cada vez que se abre, tomando la hora actual.
  useEffect(() => {
    if (visible) {
      const [vh, vm] = value.split(':');
      setSelHour(vh ?? '17');
      setSelMinute(MINUTES.includes(vm) ? vm : '00');
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={s.card}>
          <View style={s.titleRow}>
            <View style={s.clockIcon}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={INK} />
            </View>
            <Text style={s.title}>Elegir hora</Text>
          </View>

          <View style={s.columnsRow}>
            <View style={s.column}>
              <Text style={s.columnLabel}>HORA</Text>
              <ScrollView style={s.columnScroll} showsVerticalScrollIndicator={false}>
                {HOURS.map(hh => (
                  <TouchableOpacity
                    key={hh}
                    style={[s.rowItem, selHour === hh && s.rowItemActive]}
                    onPress={() => setSelHour(hh)}
                  >
                    <Text style={[s.rowText, selHour === hh && s.rowTextActive]}>{hh}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={s.colon}>:</Text>

            <View style={s.column}>
              <Text style={s.columnLabel}>MIN</Text>
              <ScrollView style={s.columnScroll} showsVerticalScrollIndicator={false}>
                {MINUTES.map(mm => (
                  <TouchableOpacity
                    key={mm}
                    style={[s.rowItem, selMinute === mm && s.rowItemActive]}
                    onPress={() => setSelMinute(mm)}
                  >
                    <Text style={[s.rowText, selMinute === mm && s.rowTextActive]}>{mm}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={s.footer}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.confirmBtn}
              onPress={() => onConfirm(`${selHour}:${selMinute}`)}
            >
              <Text style={s.confirmText}>Usar {selHour}:{selMinute}</Text>
            </TouchableOpacity>
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
    width: '100%', maxWidth: 340,
    backgroundColor: '#fff', borderRadius: 18, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  clockIcon: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: BG, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: FONT_DISP, fontSize: 18, fontWeight: '800', color: INK },

  columnsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  column: { alignItems: 'center', width: 76 },
  columnLabel: { fontFamily: FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: INK3, marginBottom: 8 },
  columnScroll: { height: 176, width: '100%' },
  colon: { fontFamily: FONT_DISP, fontSize: 22, fontWeight: '800', color: INK, marginTop: 18 },

  rowItem: {
    paddingVertical: 10, borderRadius: 10,
    alignItems: 'center', marginBottom: 4,
  },
  rowItemActive: { backgroundColor: INK },
  rowText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 16, color: INK },
  rowTextActive: { color: '#fff' },

  footer: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER, alignItems: 'center',
  },
  cancelText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 14, color: INK },
  confirmBtn: {
    flex: 1.3, paddingVertical: 14, borderRadius: 14,
    backgroundColor: ACCENT, alignItems: 'center',
  },
  confirmText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 14, color: '#fff' },
});
