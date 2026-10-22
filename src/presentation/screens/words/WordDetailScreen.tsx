import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Dimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { WordsScreenProps } from '../../navigation/types';
import PictoIcon, { iconNameFor } from '../../components/pictograms/PictoIcon';
import { useWordsStore } from '../../stores/useWordsStore';
import { useStoriesStore } from '../../stores/useStoriesStore';
import { useDialog } from '../../providers/DialogProvider';
import { sectionOf } from '../../utils/wordCategories';
import { playStep, stopVoice } from '../../utils/stepVoice';
import { T } from '../time/timeShared';

type Props = WordsScreenProps<'WordDetail'>;

const PHOTO_W = Math.min(260, Dimensions.get('window').width * 0.66);
const PHOTO_H = PHOTO_W * 1.1;

export default function WordDetailScreen({ navigation, route }: Props) {
  const word = useWordsStore(s => s.words.find(w => w.id === route.params.wordId));
  const removeWord = useWordsStore(s => s.removeWord);
  const stories = useStoriesStore(s => s.stories);
  const { showDialog } = useDialog();
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopVoice(), []);

  if (!word) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.missing}>Esta palabra ya no existe.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.link}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sec = sectionOf(word.category);
  const q = word.label.toLowerCase();
  const appears = stories.filter(
    st =>
      st.title.toLowerCase().includes(q) ||
      st.steps.some(step => step.text.toLowerCase().includes(q) || step.supportPictograms.includes(word.iconKey)),
  );

  async function listen() {
    setPlaying(true);
    await playStep({ text: word!.label, audioUrl: word!.audioUrl }, () => setPlaying(false));
    setTimeout(() => setPlaying(false), 1500);
  }

  function openMenu() {
    showDialog({
      title: word!.label,
      message: '¿Qué quieres hacer?',
      buttons: [
        { text: 'Editar', onPress: () => navigation.navigate('AddWord', { wordId: word!.id }) },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            showDialog({
              title: 'Eliminar palabra',
              message: `¿Eliminar "${word!.label}"?`,
              buttons: [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () => {
                    removeWord(word!.id);
                    navigation.goBack();
                  },
                },
              ],
            }),
        },
      ],
    });
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.top}>
        <TouchableOpacity style={s.topBtn} onPress={() => navigation.goBack()} accessibilityLabel="Regresar">
          <MaterialCommunityIcons name="arrow-left" size={22} color={T.INK} />
        </TouchableOpacity>
        <Text style={s.crumb}>Palabras / {sec.title}</Text>
        <TouchableOpacity style={s.topBtn} onPress={openMenu} accessibilityLabel="Opciones">
          <MaterialCommunityIcons name="dots-horizontal" size={22} color={T.INK} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Foto */}
        <TouchableOpacity activeOpacity={0.95} onPress={listen} style={s.photoCard}>
          <View style={s.photoHead}>
            <Text style={s.photoHeadText}>{sec.label}</Text>
          </View>
          <View style={[s.photo, { backgroundColor: sec.bg }]}>
            {word.photoUrl ? (
              <Image source={{ uri: word.photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name={iconNameFor(word.iconKey)} size={PHOTO_W * 0.5} color={sec.stroke} style={s.photoIcon} />
            )}
            <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
              <Defs>
                <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0.5" stopColor="#000" stopOpacity="0" />
                  <Stop offset="1" stopColor="#000" stopOpacity="0.72" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#fade)" />
            </Svg>
            <View style={s.photoLabel}>
              <Text style={s.photoWord}>{word.label}</Text>
              {!!word.subtitle && <Text style={s.photoSub}>{word.subtitle}</Text>}
            </View>
          </View>
        </TouchableOpacity>

        {/* Oír */}
        <TouchableOpacity style={s.hear} onPress={listen} activeOpacity={0.85}>
          <View style={s.hearIcon}>
            <MaterialCommunityIcons name={playing ? 'volume-high' : 'play'} size={20} color="#fff" />
          </View>
          <Text style={s.hearText}>Oír "{word.label}"</Text>
          {!!word.audioUrl && <MaterialCommunityIcons name="microphone" size={16} color="rgba(255,255,255,0.7)" />}
        </TouchableOpacity>

        {/* Sílabas / variantes */}
        <View style={s.row}>
          <View style={[s.card, s.flex]}>
            <Text style={s.cardLabel}>SÍLABAS</Text>
            <Text style={s.cardValue}>{word.syllables || '—'}</Text>
          </View>
          <View style={[s.card, s.flex]}>
            <Text style={s.cardLabel}>VARIANTES</Text>
            <Text style={s.cardValue} numberOfLines={2}>{word.variants.length ? word.variants.join(', ') : '—'}</Text>
          </View>
        </View>

        {/* Descripción */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddWord', { wordId: word.id })}
        >
          <Text style={s.cardLabel}>DESCRIPCIÓN</Text>
          <Text style={[s.desc, !word.description && s.placeholder]}>
            {word.description || 'Toca para contar algo de esta palabra (quién es, cómo se usa...).'}
          </Text>
        </TouchableOpacity>

        {/* Aparece en */}
        <View style={s.card}>
          <Text style={s.cardLabel}>APARECE EN</Text>
          {appears.length === 0 ? (
            <Text style={[s.desc, s.placeholder]}>Todavía no aparece en ninguna historia.</Text>
          ) : (
            <View style={s.appearRow}>
              {appears.slice(0, 6).map(st => (
                <TouchableOpacity
                  key={st.id}
                  style={s.appearItem}
                  onPress={() =>
                    navigation.getParent()?.navigate('Historias', { screen: 'StoryReader', params: { storyId: st.id } })
                  }
                >
                  <PictoIcon kind={st.iconKey} color={st.color} size={34} hideLabel />
                  <Text style={s.appearText} numberOfLines={2}>{st.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.BG },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  missing: { fontFamily: T.FONT_DISP, fontSize: 18, fontWeight: '800', color: T.INK },
  link: { fontFamily: T.FONT_BODY, fontSize: 14, fontWeight: '800', color: T.ACCENT },

  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  topBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: T.CARD,
    borderWidth: 1.5, borderColor: T.BORDER, alignItems: 'center', justifyContent: 'center',
  },
  crumb: { flex: 1, fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '800', color: T.INK2 },

  content: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },

  photoCard: {
    width: PHOTO_W, borderRadius: 22, overflow: 'hidden', borderWidth: 3, borderColor: T.INK, marginBottom: 6,
  },
  photoHead: { backgroundColor: T.INK, paddingHorizontal: 12, paddingVertical: 6 },
  photoHeadText: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#fff' },
  photo: { height: PHOTO_H, alignItems: 'center', justifyContent: 'center' },
  photoIcon: { marginBottom: PHOTO_H * 0.12 },
  photoLabel: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  photoWord: { fontFamily: T.FONT_DISP, fontSize: 34, fontWeight: '800', color: '#fff' },
  photoSub: { fontFamily: T.FONT_BODY, fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },

  hear: {
    height: 60, borderRadius: 16, backgroundColor: T.INK,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  hearIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  hearText: { fontFamily: T.FONT_DISP, fontSize: 18, fontWeight: '800', color: '#fff' },

  row: { flexDirection: 'row', gap: 10 },
  card: { backgroundColor: T.CARD, borderRadius: 14, padding: 14 },
  cardLabel: { fontFamily: T.FONT_BODY, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: T.INK3, marginBottom: 4 },
  cardValue: { fontFamily: T.FONT_DISP, fontSize: 17, fontWeight: '800', color: T.INK },
  desc: { fontFamily: T.FONT_BODY, fontSize: 14, fontWeight: '600', color: T.INK, lineHeight: 20 },
  placeholder: { color: T.INK3 },

  appearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  appearItem: {
    width: '31.5%', alignItems: 'center', gap: 4, backgroundColor: '#F4F2EE',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 4,
  },
  appearText: { fontFamily: T.FONT_BODY, fontSize: 10, fontWeight: '800', color: T.INK, textAlign: 'center' },
});
