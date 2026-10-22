import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import PictoIcon, { ICON_CHOICES } from '../pictograms/PictoIcon';
import { BG, INK, LINE_STRONG, FONT_DISP, themedStyles } from '../../theme/tokens';

interface Props {
  visible: boolean;
  title: string;
  color?: { bg: string; stroke: string };
  /** Si se pasa, colorea cada ícono con esta función */
  colorFor?: (key: string) => { bg: string; stroke: string };
  selected?: string[];
  onSelect: (key: string) => void;
  onClose: () => void;
}

const COLS = 5;
const SIZE = (Dimensions.get('window').width - 32 - 10 * (COLS - 1)) / COLS;

/** Hoja con la cuadrícula de todos los pictogramas disponibles. */
export default function IconPickerSheet({ visible, title, color, colorFor, selected = [], onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>
          <ScrollView contentContainerStyle={s.grid}>
            {ICON_CHOICES.map(key => (
              <TouchableOpacity
                key={key}
                onPress={() => onSelect(key)}
                style={[s.cell, selected.includes(key) && s.cellSelected]}
              >
                <PictoIcon kind={key} color={colorFor ? colorFor(key) : color} size={SIZE - 10} hideLabel />
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  cell: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  cellSelected: { borderColor: INK },
}));
