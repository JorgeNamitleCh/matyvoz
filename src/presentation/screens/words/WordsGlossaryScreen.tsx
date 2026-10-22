import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WordsScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { useWordsStore } from '../../stores/useWordsStore';
import { WORD_SECTIONS } from '../../utils/wordCategories';
import { T } from '../time/timeShared';

type Props = WordsScreenProps<'WordsGlossary'>;

const COLS = 4;
const PAD = 16;
const GAP = 12;
const TILE = (Dimensions.get('window').width - PAD * 2 - GAP * (COLS - 1)) / COLS;

export default function WordsGlossaryScreen({ navigation }: Props) {
  const words = useWordsStore(s => s.words);
  const loaded = useWordsStore(s => s.loaded);
  const searchTerm = useWordsStore(s => s.searchTerm);
  const setSearchTerm = useWordsStore(s => s.setSearchTerm);
  const filtered = useWordsStore(s => s.filteredWords)();

  const withPhoto = words.filter(w => !!w.photoUrl).length;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.flex}>
          <Text style={s.title}>Palabras</Text>
          <Text style={s.sub}>
            {words.length} en la familia · {withPhoto} con foto
          </Text>
        </View>
        <TouchableOpacity style={s.newBtn} onPress={() => navigation.navigate('AddWord')}>
          <Text style={s.newText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={s.search}>
        <MaterialCommunityIcons name="magnify" size={18} color={T.INK3} />
        <TextInput
          style={s.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Buscar palabra..."
          placeholderTextColor={T.INK3}
          returnKeyType="search"
        />
        {!!searchTerm && (
          <TouchableOpacity onPress={() => setSearchTerm('')} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={18} color={T.INK3} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {loaded && filtered.length === 0 && (
          <View style={s.empty}>
            <MaterialCommunityIcons name="text-search" size={40} color={T.INK3} />
            <Text style={s.emptyTitle}>{searchTerm ? `No hay "${searchTerm}"` : 'Aún no hay palabras'}</Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => navigation.navigate('AddWord')}
            >
              <Text style={s.emptyBtnText}>+ Añadir palabra</Text>
            </TouchableOpacity>
          </View>
        )}

        {WORD_SECTIONS.map(sec => {
          const list = filtered.filter(w => w.category === sec.key);
          if (list.length === 0) return null;
          return (
            <View key={sec.key}>
              <View style={[s.band, { backgroundColor: sec.bg }]}>
                <Text style={[s.bandText, { color: sec.stroke }]}>{sec.label}</Text>
              </View>
              <View style={s.grid}>
                {list.map(w => (
                  <TouchableOpacity
                    key={w.id}
                    style={s.cell}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('WordDetail', { wordId: w.id })}
                  >
                    <PictoIcon kind={w.iconKey} imageUri={w.photoUrl} color={sec} size={TILE - 6} hideLabel />
                    <Text style={s.cellText} numberOfLines={1}>{w.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Armar frase */}
      <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={() => navigation.navigate('SentenceBuilder')}>
        <MaterialCommunityIcons name="message-text-outline" size={22} color="#fff" />
        <Text style={s.fabText}>Armar frase</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.BG },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, paddingTop: 10, paddingBottom: 12 },
  title: { fontFamily: T.FONT_DISP, fontSize: 28, fontWeight: '800', color: T.INK },
  sub: { fontFamily: T.FONT_BODY, fontSize: 11, fontWeight: '700', color: T.INK3, marginTop: 1 },
  newBtn: { backgroundColor: T.INK, borderRadius: 10, paddingHorizontal: 14, height: 40, justifyContent: 'center' },
  newText: { fontFamily: T.FONT_DISP, fontSize: 14, fontWeight: '800', color: '#fff' },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: PAD, marginBottom: 14,
    backgroundColor: T.CARD, borderRadius: 12, paddingHorizontal: 12, height: 44,
    borderWidth: 1.5, borderColor: T.BORDER,
  },
  searchInput: { flex: 1, fontFamily: T.FONT_BODY, fontSize: 14, color: T.INK },

  content: { paddingBottom: 100 },
  band: { borderTopWidth: 3, borderBottomWidth: 3, borderColor: T.INK, paddingHorizontal: PAD, paddingVertical: 6 },
  bandText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: PAD, paddingVertical: 14 },
  cell: { width: TILE, alignItems: 'center' },
  cellText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK, marginTop: 5 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: T.FONT_DISP, fontSize: 20, fontWeight: '800', color: T.INK },
  emptyBtn: { height: 48, paddingHorizontal: 22, borderRadius: 24, backgroundColor: T.INK, justifyContent: 'center' },
  emptyBtnText: { fontFamily: T.FONT_DISP, fontSize: 15, fontWeight: '800', color: '#fff' },

  fab: {
    position: 'absolute', right: 16, bottom: 16, height: 54, paddingHorizontal: 20, borderRadius: 27,
    backgroundColor: T.ACCENT, flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontFamily: T.FONT_DISP, fontSize: 16, fontWeight: '800', color: '#fff' },
});
