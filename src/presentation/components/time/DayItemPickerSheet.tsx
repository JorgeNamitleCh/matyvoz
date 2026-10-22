import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PictoIcon from '../pictograms/PictoIcon';
import { DayItem } from '../../stores/useDayStore';
import { BG, SURFACE, INK, INK3, BORDER, LINE_STRONG, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

interface Props {
  visible: boolean;
  title: string;
  items: DayItem[];
  selectedId?: string | null;
  allowNone?: boolean;
  onSelect: (item: DayItem | null) => void;
  onClose: () => void;
}

/** Hoja inferior para elegir una actividad de Mi día. */
export default function DayItemPickerSheet({ visible, title, items, selectedId, allowNone, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>
          <ScrollView contentContainerStyle={s.list}>
            {allowNone && (
              <TouchableOpacity style={[s.row, !selectedId && s.rowActive]} onPress={() => onSelect(null)}>
                <View style={s.noneIcon}>
                  <MaterialCommunityIcons name="close" size={22} color={INK3} />
                </View>
                <Text style={s.rowText}>Nada</Text>
              </TouchableOpacity>
            )}
            {items.length === 0 && <Text style={s.empty}>No hay actividades en Mi día.</Text>}
            {items.map(it => (
              <TouchableOpacity
                key={it.id}
                style={[s.row, selectedId === it.id && s.rowActive]}
                onPress={() => onSelect(it)}
              >
                <PictoIcon kind={it.iconKey} imageUri={it.imageUri} color={it.color} size={44} hideLabel />
                <View style={s.rowInfo}>
                  <Text style={s.rowText} numberOfLines={1}>{it.label}</Text>
                  <Text style={s.rowSub}>{it.time}</Text>
                </View>
                {selectedId === it.id && <MaterialCommunityIcons name="check-circle" size={24} color={INK} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = themedStyles(() => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: BG, borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '75%', paddingBottom: 28 },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: LINE_STRONG, alignSelf: 'center', marginTop: 10, marginBottom: 10 },
  title: { fontFamily: FONT_DISP, fontSize: 20, fontWeight: '800', color: INK, paddingHorizontal: 18, marginBottom: 10 },
  list: { paddingHorizontal: 16, gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: SURFACE,
    borderRadius: 16, padding: 10, borderWidth: 2, borderColor: BORDER,
  },
  rowActive: { borderColor: INK },
  rowInfo: { flex: 1 },
  rowText: { fontFamily: FONT_DISP, fontSize: 17, fontWeight: '800', color: INK },
  rowSub: { fontFamily: FONT_BODY, fontSize: 12, fontWeight: '700', color: INK3 },
  noneIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: FONT_BODY, fontSize: 14, color: INK3, textAlign: 'center', paddingVertical: 20 },
}));
