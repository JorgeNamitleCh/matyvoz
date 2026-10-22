import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeOfDayPicker, { formatFriendlyTime } from './TimeOfDayPicker';
import PictoIcon from '../pictograms/PictoIcon';
import { INK, INK3, BORDER, BG, FONT_DISP, FONT_BODY } from '../../theme/tokens';

interface Props {
  visible: boolean;
  /** Actividad a la que se le cambia la hora (para el encabezado). */
  activity?: {
    label: string;
    time: string;
    iconKey: string;
    imageUri?: string;
    color: { bg: string; stroke: string };
  };
  onClose: () => void;
  onSave: (time: string) => void;
}

/**
 * Hoja inferior para cambiar la hora de una actividad ya puesta en "Mi día",
 * sin tener que borrarla y volver a crearla.
 */
export default function TimeEditModal({ visible, activity, onClose, onSave }: Props) {
  const [time, setTime] = useState(activity?.time ?? '17:00');

  useEffect(() => {
    if (visible && activity) setTime(activity.time);
  }, [visible, activity]);

  const changed = !!activity && time !== activity.time;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />

          <View style={s.header}>
            {activity && (
              <PictoIcon
                kind={activity.iconKey}
                imageUri={activity.imageUri}
                color={activity.color}
                size={52}
                hideLabel
              />
            )}
            <View style={s.headerText}>
              <Text style={s.kicker}>CAMBIAR HORA</Text>
              <Text style={s.title} numberOfLines={1}>{activity?.label}</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} accessibilityLabel="Cerrar">
              <MaterialCommunityIcons name="close" size={22} color={INK} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
            <TimeOfDayPicker value={time} onChange={setTime} />
          </ScrollView>

          <View style={s.footer}>
            <TouchableOpacity
              style={[s.saveBtn, !changed && s.saveBtnDisabled]}
              disabled={!changed}
              onPress={() => onSave(time)}
            >
              <MaterialCommunityIcons name="clock-check-outline" size={22} color="#fff" />
              <View style={s.saveTextCol}>
                <Text style={s.saveText}>Guardar hora</Text>
                <Text style={s.saveSub}>{formatFriendlyTime(time)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    maxHeight: '90%', paddingBottom: 24,
  },
  handle: {
    width: 42, height: 5, backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 3, alignSelf: 'center', marginTop: 10, marginBottom: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14 },
  headerText: { flex: 1 },
  kicker: { fontFamily: FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: INK3 },
  title: { fontFamily: FONT_DISP, fontSize: 24, fontWeight: '800', color: INK },
  closeBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: BORDER,
  },
  body: { paddingHorizontal: 18, paddingBottom: 12 },
  footer: { paddingHorizontal: 18, paddingTop: 6 },
  saveBtn: {
    minHeight: 64, borderRadius: 18, backgroundColor: INK,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  saveBtnDisabled: { opacity: 0.35 },
  saveTextCol: { alignItems: 'flex-start' },
  saveText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 18, color: '#fff' },
  saveSub: { fontFamily: FONT_BODY, fontWeight: '600', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
});
