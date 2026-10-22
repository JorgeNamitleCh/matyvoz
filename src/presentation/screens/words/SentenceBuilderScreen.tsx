import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView, Animated, Dimensions, LayoutAnimation,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WordsScreenProps } from '../../navigation/types';
import PictoIcon from '../../components/pictograms/PictoIcon';
import { useWordsStore } from '../../stores/useWordsStore';
import { CORE_WORDS } from '../../../core/domain/templates/defaultWords';
import { WORD_SECTIONS, CORE_COLORS } from '../../utils/wordCategories';
import { speech } from '../../../infrastructure/speech/speech';
import { playStep, sayText } from '../../utils/stepVoice';
import { WordCategory } from '../../../core/domain/entities';
import { T } from '../time/timeShared';
import { SURFACE, SURFACE_ALT, LINE_STRONG, ACCENT_SOFT, DANGER, themedStyles } from '../../theme/tokens';

type Props = WordsScreenProps<'SentenceBuilder'>;

/** Una pieza de la frase (palabra del glosario o del vocabulario núcleo). */
interface Piece {
  key: string;
  label: string;
  iconKey: string;
  imageUri?: string;
  audioUrl?: string;
  color: { bg: string; stroke: string };
}

type Tab = 'core' | WordCategory;

const COLS = 4;
const GAP = 10;
const TILE = (Dimensions.get('window').width - 32 - GAP * (COLS - 1)) / COLS;

/** Frases para empezar (atajos de vocabulario núcleo). */
const STARTERS: { label: string; words: string[] }[] = [
  { label: 'Yo quiero…', words: ['yo', 'quiero'] },
  { label: 'No quiero…', words: ['no quiero'] },
  { label: 'Me gusta…', words: ['me gusta'] },
  { label: 'Voy a…', words: ['voy a'] },
  { label: 'Estoy…', words: ['estoy'] },
  { label: 'Ayuda, por favor', words: ['ayuda', 'por favor'] },
];

let uid = 0;

function sentenceOf(pieces: Piece[]): string {
  if (pieces.length === 0) return '';
  const txt = pieces.map(p => p.label).join(' ');
  return txt.charAt(0).toUpperCase() + txt.slice(1) + '.';
}

export default function SentenceBuilderScreen({ navigation }: Props) {
  const words = useWordsStore(s => s.words);
  const [tab, setTab] = useState<Tab>('core');
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [speakEach, setSpeakEach] = useState(true);
  const [active, setActive] = useState(-1);
  const stripRef = useRef<ScrollView>(null);
  const pop = useRef(new Animated.Value(1)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    speech.stop();
  }, []);

  const corePieces: Piece[] = CORE_WORDS.map(c => ({
    key: `core-${c.label}`,
    label: c.label,
    iconKey: c.iconKey,
    color: CORE_COLORS[c.kind],
  }));

  function wordPieces(cat: WordCategory): Piece[] {
    const sec = WORD_SECTIONS.find(x => x.key === cat)!;
    return words
      .filter(w => w.category === cat)
      .sort((a, b) => a.label.localeCompare(b.label, 'es'))
      .map(w => ({ key: w.id, label: w.label, iconKey: w.iconKey, imageUri: w.photoUrl, audioUrl: w.audioUrl, color: sec }));
  }

  const board = tab === 'core' ? corePieces : wordPieces(tab);

  function add(p: Piece, silent = false) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPieces(list => [...list, { ...p, key: `${p.key}#${uid++}` }]);
    pop.setValue(0.6);
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    if (speakEach && !silent) playStep({ text: p.label, audioUrl: p.audioUrl }).catch(() => undefined);
    setTimeout(() => stripRef.current?.scrollToEnd({ animated: true }), 60);
  }

  function addStarter(labels: string[]) {
    labels.forEach(l => {
      const c = corePieces.find(p => p.label === l);
      if (c) add(c, true);
    });
    if (speakEach) sayText(labels.join(' '));
  }

  function removeAt(i: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPieces(list => list.filter((_, j) => j !== i));
  }

  function backspace() {
    if (pieces.length) removeAt(pieces.length - 1);
  }

  function clear() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPieces([]);
    setActive(-1);
  }

  /** Dice la frase y resalta cada pieza al ritmo aproximado de la voz. */
  function say() {
    if (!pieces.length) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    sayText(sentenceOf(pieces));
    let t = 0;
    pieces.forEach((p, i) => {
      timers.current.push(setTimeout(() => setActive(i), t));
      t += 320 + p.label.length * 75;
    });
    timers.current.push(setTimeout(() => setActive(-1), t + 200));
  }

  const sentence = sentenceOf(pieces);

  return (
    <SafeAreaView style={s.safe}>
      {/* Barra superior */}
      <View style={s.top}>
        <TouchableOpacity style={s.topBtn} onPress={() => navigation.goBack()} accessibilityLabel="Regresar">
          <MaterialCommunityIcons name="arrow-left" size={22} color={T.INK} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Armar frase</Text>
        <TouchableOpacity
          style={[s.topBtn, speakEach && s.topBtnOn]}
          onPress={() => setSpeakEach(v => !v)}
          accessibilityLabel={speakEach ? 'No decir cada palabra' : 'Decir cada palabra'}
        >
          <MaterialCommunityIcons name={speakEach ? 'volume-high' : 'volume-off'} size={20} color={speakEach ? '#fff' : T.INK} />
        </TouchableOpacity>
      </View>

      {/* Tira de la frase */}
      <View style={s.strip}>
        {pieces.length === 0 ? (
          <View style={s.stripEmpty}>
            {[0, 1, 2].map(i => <View key={i} style={s.ghost} />)}
            <Text style={s.stripHint}>Toca los dibujos para armar tu frase</Text>
          </View>
        ) : (
          <ScrollView ref={stripRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stripRow}>
            {pieces.map((p, i) => {
              const isLast = i === pieces.length - 1;
              return (
                <Animated.View key={p.key} style={isLast ? { transform: [{ scale: pop }] } : undefined}>
                  <TouchableOpacity
                    style={[s.piece, active === i && s.pieceActive]}
                    onPress={() => removeAt(i)}
                    accessibilityLabel={`Quitar ${p.label}`}
                  >
                    <PictoIcon kind={p.iconKey} imageUri={p.imageUri} color={p.color} size={60} hideLabel />
                    <Text style={s.pieceText} numberOfLines={1}>{p.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        )}
        {pieces.length > 0 && (
          <View style={s.stripFooter}>
            <Text style={s.sentence} numberOfLines={2}>{sentence}</Text>
            <TouchableOpacity style={s.iconBtn} onPress={backspace} accessibilityLabel="Borrar última">
              <MaterialCommunityIcons name="backspace-outline" size={20} color={T.INK} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={clear} accessibilityLabel="Borrar todo">
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={DANGER} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[s.sayBtn, !pieces.length && s.sayBtnOff]}
        onPress={say}
        disabled={!pieces.length}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="account-voice" size={26} color="#fff" />
        <Text style={s.sayText}>Decir frase</Text>
      </TouchableOpacity>

      {/* Pestañas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs} contentContainerStyle={s.tabsRow}>
        <TabChip label="Básicas" active={tab === 'core'} color={{ bg: SURFACE, stroke: T.INK }} onPress={() => setTab('core')} />
        {WORD_SECTIONS.map(sec => (
          <TabChip key={sec.key} label={sec.title} active={tab === sec.key} color={sec} onPress={() => setTab(sec.key)} />
        ))}
      </ScrollView>

      {/* Tablero */}
      <ScrollView contentContainerStyle={s.board} showsVerticalScrollIndicator={false}>
        {tab === 'core' && pieces.length === 0 && (
          <View style={s.starters}>
            {STARTERS.map(st => (
              <TouchableOpacity key={st.label} style={s.starter} onPress={() => addStarter(st.words)}>
                <Text style={s.starterText}>{st.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={s.grid}>
          {board.map(p => (
            <TouchableOpacity key={p.key} style={s.cell} onPress={() => add(p)} activeOpacity={0.7}>
              <PictoIcon kind={p.iconKey} imageUri={p.imageUri} color={p.color} size={TILE - 8} hideLabel />
              <Text style={s.cellText} numberOfLines={1}>{p.label}</Text>
            </TouchableOpacity>
          ))}
          {board.length === 0 && (
            <Text style={s.boardEmpty}>No hay palabras aquí todavía. Añádelas en el glosario.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TabChip({ label, active, color, onPress }: { label: string; active: boolean; color: { bg: string; stroke: string }; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.tab, { backgroundColor: active ? color.bg : SURFACE, borderColor: active ? T.INK : T.BORDER }, active && s.tabActive]}
    >
      <Text style={[s.tabText, { color: active ? color.stroke : T.INK3 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = themedStyles(() => ({
  safe: { flex: 1, backgroundColor: T.BG },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  topBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: T.CARD,
    borderWidth: 1.5, borderColor: T.BORDER, alignItems: 'center', justifyContent: 'center',
  },
  topBtnOn: { backgroundColor: T.ACCENT_FILL, borderColor: T.ACCENT },
  topTitle: { fontFamily: T.FONT_DISP, fontSize: 20, fontWeight: '800', color: T.INK },

  strip: {
    marginHorizontal: 16, backgroundColor: T.CARD, borderRadius: 20, borderWidth: 3, borderColor: T.INK,
    minHeight: 124, justifyContent: 'center', overflow: 'hidden',
  },
  stripEmpty: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8, height: 118 },
  ghost: { width: 48, height: 48, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: LINE_STRONG },
  stripHint: { flex: 1, fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', color: T.INK3, marginLeft: 4 },
  stripRow: { gap: 8, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6, alignItems: 'center' },
  piece: { alignItems: 'center', padding: 4, borderRadius: 14, borderWidth: 3, borderColor: 'transparent' },
  pieceActive: { borderColor: T.ACCENT, backgroundColor: ACCENT_SOFT },
  pieceText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK, marginTop: 3, maxWidth: 72 },
  stripFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 10, paddingTop: 4,
    borderTopWidth: 1, borderTopColor: T.BORDER,
  },
  sentence: { flex: 1, fontFamily: T.FONT_DISP, fontSize: 17, fontWeight: '800', color: T.INK },
  iconBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: SURFACE_ALT, alignItems: 'center', justifyContent: 'center',
  },

  sayBtn: {
    marginHorizontal: 16, marginTop: 10, height: 60, borderRadius: 16, backgroundColor: T.ACCENT_FILL,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  sayBtnOff: { opacity: 0.35 },
  sayText: { fontFamily: T.FONT_DISP, fontSize: 20, fontWeight: '800', color: '#fff' },

  tabs: { flexGrow: 0, flexShrink: 0, marginTop: 14 },
  tabsRow: { gap: 6, paddingHorizontal: 16, alignItems: 'center' },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 2 },
  tabActive: { borderWidth: 2.5 },
  tabText: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800' },

  board: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  starters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  starter: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: T.CARD,
    borderWidth: 1.5, borderColor: T.BORDER,
  },
  starterText: { fontFamily: T.FONT_BODY, fontSize: 13, fontWeight: '800', color: T.INK },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: { width: TILE, alignItems: 'center' },
  cellText: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK, marginTop: 4 },
  boardEmpty: { fontFamily: T.FONT_BODY, fontSize: 14, fontWeight: '600', color: T.INK3, paddingVertical: 20 },
}));
