import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { DayScreenProps } from '../../navigation/types';
import PictoIcon, { CATEGORY_SWATCHES, ICON_CHOICES } from '../../components/pictograms/PictoIcon';
import PictogramPicker, { PictogramMode } from '../../components/common/PictogramPicker';
import { useCatalogStore } from '../../stores/useCatalogStore';

type Props = DayScreenProps<'AddCatalogActivity'>;

const INK = '#2D2620';
const BORDER = 'rgba(0,0,0,0.08)';
const INK3 = '#8a8a8a';
const FONT_DISP = 'Nunito ExtraLight';
const FONT_BODY = 'Atkinson Hyperlegible';

export default function AddCatalogActivityScreen({ navigation }: Props) {
  const categories = useCatalogStore(state => state.categories);
  const addCategory = useCatalogStore(state => state.addCategory);
  const addItem = useCatalogStore(state => state.addItem);

  const [name, setName] = useState('');
  const [mode, setMode] = useState<PictogramMode>('icon');
  const [iconKey, setIconKey] = useState<string>(ICON_CHOICES[0]);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null);

  const [showNewType, setShowNewType] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeSwatch, setNewTypeSwatch] = useState(0);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const categoryColor = selectedCategory ? { bg: selectedCategory.bg, stroke: selectedCategory.stroke } : undefined;
  const canSave = name.trim().length > 0 && !!categoryId && (mode === 'icon' || !!imageUri);

  function openNewType() {
    setNewTypeLabel('');
    setNewTypeSwatch(0);
    setShowNewType(true);
  }

  function handleCreateType() {
    if (!newTypeLabel.trim()) return;
    const category = addCategory(newTypeLabel, CATEGORY_SWATCHES[newTypeSwatch]);
    setCategoryId(category.id);
    setShowNewType(false);
  }

  function handleSave() {
    if (!canSave || !categoryId) return;
    addItem({
      iconKey: mode === 'icon' ? iconKey : 'mas',
      imageUri: mode === 'image' ? imageUri : undefined,
      label: name.trim().toLowerCase(),
      categoryId,
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.backdrop} onPress={() => navigation.goBack()} />

      <View style={s.sheet}>
        <View style={s.handle} />

        {/* Preview */}
        <View style={s.previewRow}>
          <PictoIcon
            kind={iconKey}
            imageUri={mode === 'image' ? imageUri : undefined}
            color={categoryColor}
            size={64}
            hideLabel
          />
          <View style={s.previewInfo}>
            {selectedCategory && (
              <View style={[s.catBadge, { backgroundColor: selectedCategory.bg }]}>
                <Text style={[s.catBadgeText, { color: selectedCategory.stroke }]}>{selectedCategory.label}</Text>
              </View>
            )}
            <Text style={s.previewName}>{name.trim() || 'Nueva actividad'}</Text>
          </View>
        </View>
        <View style={s.divider} />

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Nombre */}
          <Text style={s.label}>NOMBRE</Text>
          <TextInput
            style={s.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Ej. pintar, ir al doctor…"
            placeholderTextColor={INK3}
          />

          <View style={s.section}>
            <PictogramPicker
              mode={mode}
              onModeChange={setMode}
              iconKey={iconKey}
              onIconKeyChange={setIconKey}
              imageUri={imageUri}
              onImageUriChange={setImageUri}
              color={categoryColor}
            />
          </View>

          {/* Tipo */}
          <Text style={s.labelSpaced}>TIPO</Text>
          <View style={s.typeRow}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[
                  s.typeChip,
                  { backgroundColor: cat.bg, borderColor: cat.stroke },
                  categoryId === cat.id && s.typeChipActive,
                ]}
              >
                <Text style={[s.typeChipText, { color: cat.stroke }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.newTypeChip} onPress={openNewType}>
              <Text style={s.newTypeChipText}>＋ Nuevo tipo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Botones */}
        <View style={s.footer}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.addBtn, !canSave && s.addBtnDisabled]}
            disabled={!canSave}
            onPress={handleSave}
          >
            <Text style={s.addText}>Guardar actividad</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal: nuevo tipo */}
      <Modal
        visible={showNewType}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewType(false)}
      >
        <KeyboardAvoidingView
          style={s.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowNewType(false)}
          />
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Nuevo tipo</Text>

            <Text style={s.labelSpaced}>NOMBRE DEL TIPO</Text>
            <TextInput
              style={s.nameInput}
              value={newTypeLabel}
              onChangeText={setNewTypeLabel}
              placeholder="Ej. escuela, deporte…"
              placeholderTextColor={INK3}
              autoFocus
            />

            <Text style={s.labelModalColor}>COLOR</Text>
            <View style={s.swatchRow}>
              {CATEGORY_SWATCHES.map((sw, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setNewTypeSwatch(i)}
                  style={[
                    s.swatch,
                    { backgroundColor: sw.bg, borderColor: sw.stroke },
                    newTypeSwatch === i && s.swatchActive,
                  ]}
                />
              ))}
            </View>

            <View style={s.modalFooter}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowNewType(false)}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.createTypeBtn, !newTypeLabel.trim() && s.addBtnDisabled]}
                disabled={!newTypeLabel.trim()}
                onPress={handleCreateType}
              >
                <Text style={s.addText}>Crear tipo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 18, paddingBottom: 22,
    maxHeight: '86%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15, shadowRadius: 20,
  },
  handle: {
    width: 38, height: 4, backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 14,
  },

  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14 },
  previewInfo: { flex: 1 },
  catBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 5, marginBottom: 4,
  },
  catBadgeText: { fontFamily: FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  previewName: { fontFamily: FONT_DISP, fontSize: 22, fontWeight: '800', color: INK },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 14 },

  content: { paddingBottom: 8 },
  section: { marginTop: 16 },

  label: { fontFamily: FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: INK3, marginBottom: 8 },
  labelSpaced: { fontFamily: FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: INK3, marginBottom: 8, marginTop: 16 },
  labelModalColor: { fontFamily: FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: INK3, marginBottom: 8, marginTop: 14 },

  nameInput: {
    backgroundColor: '#EFEEEA', borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    fontFamily: FONT_BODY, fontSize: 14, color: INK,
  },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5,
    opacity: 0.55,
  },
  typeChipActive: { opacity: 1, borderWidth: 2.5 },
  typeChipText: { fontFamily: FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },

  newTypeChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: BORDER, borderStyle: 'dashed',
  },
  newTypeChipText: { fontFamily: FONT_BODY, fontSize: 12, fontWeight: '700', color: '#2A5F8F' },

  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: {
    width: 32, height: 32, borderRadius: 10, borderWidth: 2,
  },
  swatchActive: { borderWidth: 3, transform: [{ scale: 1.1 }] },
  createTypeBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 14,
    backgroundColor: INK, alignItems: 'center',
  },

  footer: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER, alignItems: 'center',
  },
  cancelText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 15, color: INK },
  addBtn: {
    flex: 1.4, paddingVertical: 16, borderRadius: 14,
    backgroundColor: INK, alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
  addText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 15, color: '#fff' },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalCard: {
    width: '100%', maxWidth: 380,
    backgroundColor: '#fff', borderRadius: 18, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16,
  },
  modalTitle: { fontFamily: FONT_DISP, fontSize: 18, fontWeight: '800', color: INK, marginBottom: 14 },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
