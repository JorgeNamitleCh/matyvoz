import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PictoIcon, { ICON_CHOICES } from '../pictograms/PictoIcon';
import { pickImageFromCamera, pickImageFromLibrary } from '../../utils/pickActivityImage';
import { useDialog } from '../../providers/DialogProvider';
import { BG, SURFACE, INK, INK3, BORDER, ACCENT, PRIMARY, FONT_BODY, themedStyles } from '../../theme/tokens';

export type PictogramMode = 'icon' | 'image';

interface PictogramPickerProps {
  label?: string;
  mode: PictogramMode;
  onModeChange: (mode: PictogramMode) => void;
  iconKey: string;
  onIconKeyChange: (key: string) => void;
  imageUri?: string;
  onImageUriChange: (uri: string | undefined) => void;
  /** Color del tipo/categoría seleccionada — tiñe los íconos del grid. */
  color?: { bg: string; stroke: string };
}

/**
 * Selector de pictograma reutilizable: ícono del catálogo o foto propia
 * (cámara/galería), llenando el recuadro completo. Se usa tanto al crear
 * una actividad nueva como al editar una ya existente — mismo componente,
 * mismo comportamiento en los dos lugares.
 */
export default function PictogramPicker({
  label = 'PICTOGRAMA',
  mode,
  onModeChange,
  iconKey,
  onIconKeyChange,
  imageUri,
  onImageUriChange,
  color,
}: PictogramPickerProps) {
  const { showDialog } = useDialog();
  const [busy, setBusy] = useState(false);

  async function handlePickFromCamera() {
    setBusy(true);
    try {
      const uri = await pickImageFromCamera();
      if (uri) onImageUriChange(uri);
    } catch {
      showDialog({ title: 'No se pudo abrir la cámara', message: 'Revisa los permisos de cámara en Ajustes.' });
    } finally {
      setBusy(false);
    }
  }

  async function handlePickFromLibrary() {
    setBusy(true);
    try {
      const uri = await pickImageFromLibrary();
      if (uri) onImageUriChange(uri);
    } catch {
      showDialog({ title: 'No se pudo abrir la galería', message: 'Revisa los permisos de fotos en Ajustes.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <View style={s.modeRow}>
        <TouchableOpacity
          style={[s.modeChip, mode === 'icon' && s.modeChipActive]}
          onPress={() => onModeChange('icon')}
        >
          <MaterialCommunityIcons name="shape-outline" size={16} color={mode === 'icon' ? '#fff' : INK} />
          <Text style={[s.modeChipText, mode === 'icon' && s.modeChipTextActive]}>Ícono</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.modeChip, mode === 'image' && s.modeChipActive]}
          onPress={() => onModeChange('image')}
        >
          <MaterialCommunityIcons name="image-outline" size={16} color={mode === 'image' ? '#fff' : INK} />
          <Text style={[s.modeChipText, mode === 'image' && s.modeChipTextActive]}>Imagen</Text>
        </TouchableOpacity>
      </View>

      {mode === 'icon' ? (
        <View style={s.iconGrid}>
          {ICON_CHOICES.map(key => (
            <TouchableOpacity
              key={key}
              onPress={() => onIconKeyChange(key)}
              style={[s.iconPickCell, iconKey === key && s.iconPickCellActive]}
            >
              <PictoIcon kind={key} color={color} size={40} hideLabel />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View>
          {imageUri ? (
            <View style={s.imagePreviewRow}>
              <View style={s.imagePreviewBox}>
                <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
                <TouchableOpacity style={s.imageRemoveBtn} onPress={() => onImageUriChange(undefined)}>
                  <MaterialCommunityIcons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={s.imagePreviewActions}>
                <TouchableOpacity style={s.imageSourceBtnSmall} onPress={handlePickFromCamera} disabled={busy}>
                  <MaterialCommunityIcons name="camera" size={16} color={INK} />
                  <Text style={s.imageSourceBtnText}>Cámara</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.imageSourceBtnSmall} onPress={handlePickFromLibrary} disabled={busy}>
                  <MaterialCommunityIcons name="image-multiple" size={16} color={INK} />
                  <Text style={s.imageSourceBtnText}>Galería</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.imageSourceRow}>
              <TouchableOpacity style={s.imageSourceBtn} onPress={handlePickFromCamera} disabled={busy}>
                <MaterialCommunityIcons name="camera" size={22} color={INK} />
                <Text style={s.imageSourceBtnText}>Tomar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.imageSourceBtn} onPress={handlePickFromLibrary} disabled={busy}>
                <MaterialCommunityIcons name="image-multiple" size={22} color={INK} />
                <Text style={s.imageSourceBtnText}>Elegir de galería</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const s = themedStyles(() => ({
  label: { fontFamily: FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: INK3, marginBottom: 8 },

  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
  },
  modeChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  modeChipText: { fontFamily: FONT_BODY, fontSize: 13, fontWeight: '700', color: INK },
  modeChipTextActive: { color: '#fff' },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconPickCell: {
    padding: 3, borderRadius: 14,
    borderWidth: 2, borderColor: 'transparent',
  },
  iconPickCellActive: { borderColor: ACCENT },

  imageSourceRow: { flexDirection: 'row', gap: 10 },
  imageSourceBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: 18, borderRadius: 14,
    backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER, borderStyle: 'dashed',
  },
  imageSourceBtnSmall: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER,
  },
  imageSourceBtnText: { fontFamily: FONT_BODY, fontSize: 12, fontWeight: '700', color: INK },
  imagePreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  imagePreviewBox: {
    width: 84, height: 84, borderRadius: 18,
    borderWidth: 2, borderColor: BORDER, overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageRemoveBtn: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  imagePreviewActions: { gap: 8 },
}));
