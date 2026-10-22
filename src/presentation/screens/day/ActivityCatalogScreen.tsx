import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DayScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { useCatalogStore } from '../../stores/useCatalogStore';
import { useDialog } from '../../providers/DialogProvider';
import { BG, SURFACE, INK, INK3, BORDER, PRIMARY, INK_ON_PASTEL, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

type Props = DayScreenProps<'ActivityCatalog'>;

const SEARCH_ICON_BG = '#E8E0D0';

const SCREEN_W = Dimensions.get('window').width;
const GRID_PAD = 14;
const GRID_GAP = 8;
const ITEM_SIZE = (SCREEN_W - GRID_PAD * 2 - GRID_GAP * 3) / 4;

const FILTERS = ['Todas', 'Diarias', 'Salud', 'Social'];

export default function ActivityCatalogScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todas');
  const categories = useCatalogStore(state => state.categories);
  const items = useCatalogStore(state => state.items);
  const removeItem = useCatalogStore(state => state.removeItem);
  const { showDialog } = useDialog();

  function confirmDelete(itemId: string, label: string) {
    showDialog({
      title: 'Eliminar actividad',
      message: `¿Quitar "${label}" del catálogo?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeItem(itemId) },
      ],
    });
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Catálogo de actividades</Text>
          <Text style={s.headerSub}>Toca para añadir · mantén presionada para eliminar</Text>
        </View>
        <TouchableOpacity
          style={[s.iconBtn, s.newBtn]}
          onPress={() => navigation.navigate('AddCatalogActivity')}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <View style={s.searchIconBox}>
          <MaterialCommunityIcons name="magnify" size={16} color={INK_ON_PASTEL} />
        </View>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar actividad…"
          placeholderTextColor={INK3}
        />
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersScroll} contentContainerStyle={s.filtersContent}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid por sección */}
      <ScrollView style={s.gridScroll}>
        {categories.map(cat => {
          const sectionItems = items.filter(it => it.categoryId === cat.id);
          const filtered = search
            ? sectionItems.filter(it => it.label.toLowerCase().includes(search.toLowerCase()))
            : sectionItems;
          if (filtered.length === 0) return null;
          return (
            <View key={cat.id}>
              {/* Franja categoría */}
              <View style={[s.catStrip, { borderTopColor: cat.stroke, borderBottomColor: cat.stroke, backgroundColor: cat.bg }]}>
                <Text style={[s.catStripText, { color: cat.stroke }]}>{cat.label}</Text>
              </View>
              {/* Grid 4 columnas */}
              <View style={s.grid}>
                {filtered.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={s.gridItem}
                    onPress={() => navigation.navigate('AddActivity', { catalogItemId: item.id })}
                    onLongPress={() => confirmDelete(item.id, item.label)}
                  >
                    <PictoIcon
                      kind={item.iconKey}
                      imageUri={item.imageUri}
                      color={{ bg: cat.bg, stroke: cat.stroke }}
                      size={ITEM_SIZE - 16}
                      label={item.label}
                    />
                    <View style={s.addBadge}>
                      <Text style={s.addBadgeText}>＋</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingTop: 4, paddingBottom: 8,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  newBtn: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  backArrow: { fontSize: 16, color: INK },
  headerTitle: { fontFamily: FONT_DISP, fontSize: 18, fontWeight: '800', color: INK },
  headerSub: { fontFamily: FONT_BODY, fontSize: 11, color: INK3, fontWeight: '600' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 14, marginBottom: 10,
    backgroundColor: SURFACE, borderRadius: 10,
    borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 8, paddingVertical: 8,
  },
  searchIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: SEARCH_ICON_BG,
    alignItems: 'center', justifyContent: 'center',
  },
  searchInput: { flex: 1, fontFamily: FONT_BODY, fontSize: 13, color: INK },

  // ScrollView trae flexGrow:1 por defecto: sin flexGrow:0 el carrusel horizontal
  // se estira verticalmente cuando la lista de abajo tiene pocos elementos.
  filtersScroll: { flexGrow: 0, flexShrink: 0 },
  filtersContent: { paddingHorizontal: 14, gap: 6, paddingVertical: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: SURFACE, borderWidth: 1.5, borderColor: BORDER,
  },
  gridScroll: { flex: 1 },
  filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterText: { fontFamily: FONT_BODY, fontSize: 12, fontWeight: '700', color: INK },
  filterTextActive: { color: '#fff' },

  catStrip: {
    borderTopWidth: 3, borderBottomWidth: 3,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  catStripText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: GRID_PAD, gap: GRID_GAP,
  },
  gridItem: {
    width: ITEM_SIZE, alignItems: 'center',
    position: 'relative',
  },
  addBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: PRIMARY, borderWidth: 2, borderColor: SURFACE,
    alignItems: 'center', justifyContent: 'center',
  },
  addBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 14 },
}));
