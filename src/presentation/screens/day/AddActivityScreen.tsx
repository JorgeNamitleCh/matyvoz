import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, LayoutAnimation,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DayScreenProps } from '../../navigation/types';
import PictoIcon, { CAT } from '../../components/pictograms/PictoIcon';
import PictogramPicker, { PictogramMode } from '../../components/common/PictogramPicker';
import TimeOfDayPicker, { formatFriendlyTime, nextRoundHour } from '../../components/common/TimeOfDayPicker';
import { useCatalogStore } from '../../stores/useCatalogStore';
import { useDayStore } from '../../stores/useDayStore';
import { useDialog } from '../../providers/DialogProvider';
import { ActivityRecurrence } from '../../../core/domain/entities';
import { BG, SURFACE, INK, INK3, BORDER, LINE_STRONG, ACCENT, ACCENT_FILL, PRIMARY, DANGER, DANGER_BG, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

type Props = DayScreenProps<'AddActivity'>;


const RECURRENCES: { key: ActivityRecurrence; label: string; hint: string; icon: string }[] = [
  { key: 'once',     label: 'Solo hoy',      hint: 'Una vez',           icon: 'calendar-today' },
  { key: 'daily',    label: 'Diario',        hint: 'Todos los días',    icon: 'calendar-sync' },
  { key: 'weekdays', label: 'Entre semana',  hint: 'Lunes a viernes',   icon: 'school-outline' },
  { key: 'weekends', label: 'Fin de semana', hint: 'Sábado y domingo',  icon: 'sofa-outline' },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <View style={s.step}>
      <View style={s.stepHeader}>
        <View style={s.stepNum}><Text style={s.stepNumText}>{n}</Text></View>
        <Text style={s.stepTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function AddActivityScreen({ route, navigation }: Props) {
  const { catalogItemId, dayItemId } = route.params;
  // Modo edición: se abrió tocando una actividad de Mi día.
  const dayItem = useDayStore(state => (dayItemId ? state.items.find(i => i.id === dayItemId) : undefined));
  const isEdit = !!dayItem;
  const sourceCatalogId = catalogItemId ?? dayItem?.catalogItemId;
  const item = useCatalogStore(state => state.items.find(it => it.id === sourceCatalogId));
  const category = useCatalogStore(state =>
    item ? state.categories.find(c => c.id === item.categoryId) : undefined,
  );
  const updateItem = useCatalogStore(state => state.updateItem);
  const removeItem = useCatalogStore(state => state.removeItem);
  const addDayItem = useDayStore(state => state.addItem);
  const updateDayItem = useDayStore(state => state.updateItem);
  const removeDayItem = useDayStore(state => state.removeItem);
  const { showDialog } = useDialog();

  // Nombre editable (ej. "cole" → "Ir al cole"); se guarda en el catálogo.
  const [name, setName] = useState(dayItem?.label ?? item?.label ?? 'actividad');
  const [editingName, setEditingName] = useState(false);
  const rawLabel = name.trim() || item?.label || 'actividad';
  const activityLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  // Evita que un doble toque en "Añadir" agregue la actividad dos veces.
  const submitting = useRef(false);
  const cat = dayItem
    ? { bg: dayItem.color.bg, stroke: dayItem.color.stroke, label: dayItem.categoryLabel }
    : category ?? CAT.lugar;

  // Pictograma editable — arranca con lo que ya tiene la actividad guardada.
  const initialImage = dayItem ? dayItem.imageUri : item?.imageUri;
  const [mode, setMode] = useState<PictogramMode>(initialImage ? 'image' : 'icon');
  const [iconKey, setIconKey] = useState<string>(
    (dayItem?.iconKey ?? item?.iconKey ?? 'parque') === 'mas' && !initialImage
      ? 'parque'
      : dayItem?.iconKey ?? item?.iconKey ?? 'parque',
  );
  const [imageUri, setImageUri] = useState<string | undefined>(initialImage);
  const [editingPicto, setEditingPicto] = useState(false);

  const [hour, setHour] = useState(() => dayItem?.time ?? nextRoundHour());
  const [recurrence, setRecurrence] = useState<ActivityRecurrence>(dayItem?.recurrence ?? 'once');

  const recurrenceHint = RECURRENCES.find(r => r.key === recurrence)?.hint ?? '';

  function togglePicto() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingPicto(v => !v);
  }

  function handleDelete() {
    if (dayItem) {
      showDialog({
        title: 'Quitar de mi día',
        message: `¿Quitar "${activityLabel}" de Mi día?`,
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Quitar',
            style: 'destructive',
            onPress: () => {
              removeDayItem(dayItem.id);
              navigation.goBack();
            },
          },
        ],
      });
      return;
    }
    showDialog({
      title: 'Eliminar del catálogo',
      message: `¿Quitar "${activityLabel}" del catálogo? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            if (item) removeItem(item.id);
            navigation.goBack();
          },
        },
      ],
    });
  }

  function commitName() {
    setEditingName(false);
    const clean = name.trim();
    if (!clean) {
      setName(item?.label ?? 'actividad');
      return;
    }
    // En edición, el nombre se guarda con "Guardar cambios".
    if (!isEdit && item && clean !== item.label) updateItem(item.id, { label: clean });
  }

  function handleSaveEdit() {
    if (!dayItem || submitting.current) return;
    submitting.current = true;
    const ok = updateDayItem(dayItem.id, {
      label: activityLabel,
      iconKey: mode === 'icon' ? iconKey : 'mas',
      imageUri: mode === 'image' ? imageUri : undefined,
      time: hour,
      recurrence,
    });
    if (!ok) {
      submitting.current = false;
      showDialog({
        title: 'Ya está en tu día',
        message: `Ya hay otra "${activityLabel}" a las ${formatFriendlyTime(hour)}. Elige otra hora.`,
      });
      return;
    }
    navigation.goBack();
  }

  function handleAddToDay() {
    if (submitting.current) return;
    submitting.current = true;

    const finalIconKey = mode === 'icon' ? iconKey : 'mas';
    const finalImageUri = mode === 'image' ? imageUri : undefined;
    const cleanName = name.trim();
    if (item) {
      updateItem(item.id, {
        iconKey: finalIconKey,
        imageUri: finalImageUri,
        ...(cleanName && cleanName !== item.label ? { label: cleanName } : {}),
      });
    }
    const added = addDayItem({
      catalogItemId: item?.id,
      time: hour,
      label: activityLabel,
      iconKey: finalIconKey,
      imageUri: finalImageUri,
      color: { bg: cat.bg, stroke: cat.stroke },
      categoryLabel: cat.label,
      recurrence,
    });
    if (!added) {
      submitting.current = false;
      showDialog({
        title: 'Ya está en tu día',
        message: `"${activityLabel}" ya está a las ${formatFriendlyTime(hour)}. Elige otra hora si quieres repetirla.`,
      });
      return;
    }
    navigation.navigate('Day');
  }

  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => navigation.goBack()} />

      <View style={s.sheet}>
        <View style={s.handle} />

        {/* Barra superior */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.roundBtn} onPress={() => navigation.goBack()} accessibilityLabel="Cerrar">
            <MaterialCommunityIcons name="close" size={22} color={INK} />
          </TouchableOpacity>
          <Text style={s.topTitle}>{isEdit ? 'Editar actividad' : 'Añadir a mi día'}</Text>
          <TouchableOpacity style={[s.roundBtn, s.trashBtn]} onPress={handleDelete} accessibilityLabel={isEdit ? 'Quitar de mi día' : 'Eliminar del catálogo'}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={DANGER} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Tarjeta de la actividad */}
          <View style={[s.hero, { backgroundColor: cat.bg, borderColor: cat.stroke }]}>
            <PictoIcon
              kind={iconKey}
              imageUri={mode === 'image' ? imageUri : undefined}
              color={{ bg: '#FFFFFF', stroke: cat.stroke }}
              size={92}
              hideLabel
            />
            <View style={s.heroInfo}>
              <Text style={[s.heroCat, { color: cat.stroke }]} numberOfLines={1}>{cat.label}</Text>
              {editingName ? (
                <TextInput
                  style={[s.heroName, s.nameInput, { color: cat.stroke, borderColor: cat.stroke }]}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  maxLength={40}
                  returnKeyType="done"
                  onSubmitEditing={commitName}
                  onBlur={commitName}
                  selectTextOnFocus
                />
              ) : (
                <TouchableOpacity
                  style={s.nameRow}
                  onPress={() => setEditingName(true)}
                  accessibilityLabel="Cambiar nombre"
                >
                  <Text style={[s.heroName, { color: cat.stroke }]} numberOfLines={2}>{activityLabel}</Text>
                  <MaterialCommunityIcons name="pencil" size={18} color={cat.stroke} style={s.namePencil} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.changeBtn} onPress={togglePicto}>
                <MaterialCommunityIcons
                  name={editingPicto ? 'check' : 'pencil-outline'}
                  size={16}
                  color={INK}
                />
                <Text style={s.changeText}>{editingPicto ? 'Listo' : 'Cambiar dibujo'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {editingPicto && (
            <View style={s.pictoBox}>
              <PictogramPicker
                label="DIBUJO O FOTO"
                mode={mode}
                onModeChange={setMode}
                iconKey={iconKey}
                onIconKeyChange={setIconKey}
                imageUri={imageUri}
                onImageUriChange={setImageUri}
                color={{ bg: cat.bg, stroke: cat.stroke }}
              />
            </View>
          )}

          {/* 1 · Hora */}
          <Step n={1} title="¿A qué hora?">
            <TimeOfDayPicker value={hour} onChange={setHour} />
          </Step>

          {/* 2 · Repetición */}
          <Step n={2} title="¿Se repite?">
            <View style={s.recGrid}>
              {RECURRENCES.map(r => {
                const active = recurrence === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[s.recTile, active && s.recTileActive]}
                    onPress={() => setRecurrence(r.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <MaterialCommunityIcons name={r.icon} size={26} color={active ? '#fff' : INK} />
                    <Text style={[s.recLabel, active && s.textOnDark]}>{r.label}</Text>
                    <Text style={[s.recHint, active && s.hintOnDark]}>{r.hint}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Step>

          {/* 3 · Historia */}
          <Step n={3} title="Historia para anticipar (opcional)">
            <TouchableOpacity style={s.storyRow} activeOpacity={0.8}>
              <View style={s.storyIcon}>
                <MaterialCommunityIcons name="book-open-page-variant" size={24} color={ACCENT} />
              </View>
              <View style={s.storyInfo}>
                <Text style={s.storyTitle}>Ir al {rawLabel}</Text>
                <Text style={s.storySub}>4 pasos</Text>
              </View>
              <Text style={s.cambiarText}>Cambiar</Text>
            </TouchableOpacity>
          </Step>
        </ScrollView>

        {/* Acción principal */}
        <View style={s.footer}>
          <TouchableOpacity
            style={s.addBtn}
            onPress={isEdit ? handleSaveEdit : handleAddToDay}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name={isEdit ? 'content-save-outline' : 'calendar-plus'} size={24} color="#fff" />
            <View style={s.addTextCol}>
              <Text style={s.addText}>{isEdit ? 'Guardar cambios' : 'Añadir a mi día'}</Text>
              <Text style={s.addSub} numberOfLines={1}>
                {formatFriendlyTime(hour)} · {recurrenceHint}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backdrop: { flex: 1, minHeight: 40, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    maxHeight: '94%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
  },
  handle: {
    width: 42, height: 5, backgroundColor: LINE_STRONG,
    borderRadius: 3, alignSelf: 'center', marginTop: 10, marginBottom: 6,
  },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  topTitle: { fontFamily: FONT_DISP, fontSize: 18, fontWeight: '800', color: INK },
  roundBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: SURFACE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: BORDER,
  },
  trashBtn: { backgroundColor: DANGER_BG, borderColor: 'rgba(178,59,59,0.25)' },

  content: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },

  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 22, borderWidth: 2.5, padding: 14,
  },
  heroInfo: { flex: 1, gap: 2 },
  heroCat: { fontFamily: FONT_BODY, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, opacity: 0.8 },
  heroName: { fontFamily: FONT_DISP, fontSize: 28, fontWeight: '800', lineHeight: 32, flexShrink: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  namePencil: { opacity: 0.7 },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 2, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  changeBtn: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: SURFACE, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginTop: 6,
  },
  changeText: { fontFamily: FONT_BODY, fontSize: 13, fontWeight: '800', color: INK },

  pictoBox: {
    backgroundColor: SURFACE, borderRadius: 20, padding: 14,
    borderWidth: 1.5, borderColor: BORDER,
  },

  step: {
    backgroundColor: SURFACE, borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: BORDER,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  stepNum: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: ACCENT_FILL,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontFamily: FONT_DISP, fontSize: 16, fontWeight: '800', color: '#fff' },
  stepTitle: { fontFamily: FONT_DISP, fontSize: 20, fontWeight: '800', color: INK, flexShrink: 1 },

  recGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  recTile: {
    width: '48%', minHeight: 96, borderRadius: 16,
    backgroundColor: BG, borderWidth: 2, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10,
  },
  recTileActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  recLabel: { fontFamily: FONT_DISP, fontSize: 16, fontWeight: '800', color: INK, textAlign: 'center' },
  recHint: { fontFamily: FONT_BODY, fontSize: 12, fontWeight: '600', color: INK3, textAlign: 'center' },
  textOnDark: { color: '#fff' },
  hintOnDark: { color: 'rgba(255,255,255,0.75)' },

  storyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: BG, borderRadius: 16, padding: 12,
    borderWidth: 1.5, borderColor: BORDER,
  },
  storyIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: SURFACE,
    alignItems: 'center', justifyContent: 'center',
  },
  storyInfo: { flex: 1 },
  storyTitle: { fontFamily: FONT_DISP, fontSize: 16, fontWeight: '800', color: INK },
  storySub: { fontFamily: FONT_BODY, fontSize: 12, color: INK3, fontWeight: '600' },
  cambiarText: { fontFamily: FONT_BODY, fontSize: 14, color: ACCENT, fontWeight: '800' },

  footer: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: BG,
  },
  addBtn: {
    minHeight: 64, borderRadius: 18, backgroundColor: PRIMARY,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingHorizontal: 18,
  },
  addTextCol: { alignItems: 'flex-start', flexShrink: 1 },
  addText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 18, color: '#fff' },
  addSub: { fontFamily: FONT_BODY, fontWeight: '600', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
}));
