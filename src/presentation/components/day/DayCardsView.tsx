import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, View, Text, Image, TouchableOpacity, Dimensions, LayoutChangeEvent,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { iconNameFor } from '../pictograms/PictoIcon';
import { formatShortTime } from '../common/TimeOfDayPicker';
import { DayItem } from '../../stores/useDayStore';
import { SURFACE, INK, INK3, BORDER, ACCENT, ACCENT_SOFT, ACCENT_FILL, PRIMARY, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

interface Props {
  items: DayItem[];
  onPressItem: (item: DayItem) => void;
  onPressTime: (item: DayItem) => void;
  onMarkDone: (item: DayItem) => void;
}

const SIDE = 16;
const GAP = 18;
const PAD_TOP = 8;
const CARD_W = Dimensions.get('window').width - SIDE * 2;
const IMG_H = Math.round(CARD_W * 0.72);
const INFO_H = 118;
const CARD_H = IMG_H + INFO_H;
const STEP = CARD_H + GAP;

/**
 * Vista "Tarjetas" de Mi día: una tarjeta grande por actividad con la foto
 * o el pictograma a todo lo ancho. Al hacer scroll, la tarjeta que entra
 * por abajo crece y aparece suavemente, y la que sale por arriba se
 * encoge y se desvanece.
 */
export default function DayCardsView({ items, onPressItem, onPressTime, onMarkDone }: Props) {
  const scrollY = useRef(new Animated.Value(0)).current;
   
  const scrollRef = useRef<any>(null);
  const [viewportH, setViewportH] = useState(Dimensions.get('window').height * 0.7);

  // Al abrir, lleva a la vista la actividad de "ahora".
  const nowIndex = items.findIndex(it => it.state === 'now');
  useEffect(() => {
    if (nowIndex > 0) {
      const t = setTimeout(() => {
        scrollRef.current?.scrollTo?.({ y: nowIndex * STEP, animated: true });
      }, 250);
      return () => clearTimeout(t);
    }
    return undefined;
    // Solo al montar la vista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={s.scroll}
      contentContainerStyle={s.content}
      onLayout={(e: LayoutChangeEvent) => setViewportH(e.nativeEvent.layout.height)}
      scrollEventThrottle={16}
      snapToInterval={STEP}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
      })}
    >
      {items.map((it, index) => {
        const top = PAD_TOP + index * STEP;
        // Posiciones de scroll en las que la tarjeta: asoma abajo → llega a
        // su tamaño → empieza a salir arriba → ya salió.
        const input = [
          top - viewportH,
          top - viewportH + CARD_H * 0.75,
          top,
          top + CARD_H,
        ];
        const scale = scrollY.interpolate({ inputRange: input, outputRange: [0.86, 1, 1, 0.9], extrapolate: 'clamp' });
        const opacity = scrollY.interpolate({ inputRange: input, outputRange: [0.35, 1, 1, 0.35], extrapolate: 'clamp' });
        const translateY = scrollY.interpolate({ inputRange: input, outputRange: [40, 0, 0, 0], extrapolate: 'clamp' });

        const done = it.state === 'done';
        const now = it.state === 'now';

        return (
          <Animated.View
            key={it.id}
            style={[s.cardWrap, { opacity, transform: [{ translateY }, { scale }] }]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onPressItem(it)}
              style={[s.card, now && s.cardNow]}
              accessibilityHint="Toca para editar"
            >
              {/* Imagen / pictograma grande */}
              <View style={[s.media, { backgroundColor: it.color.bg }]}>
                {it.imageUri ? (
                  <Image source={{ uri: it.imageUri }} style={s.image} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons name={iconNameFor(it.iconKey)} size={IMG_H * 0.5} color={it.color.stroke} />
                )}

                {now && (
                  <View style={s.nowRibbon}>
                    <View style={s.nowDot} />
                    <Text style={s.nowRibbonText}>AHORA</Text>
                  </View>
                )}

                {done && (
                  <View style={s.doneOverlay}>
                    <View style={s.doneBadge}>
                      <MaterialCommunityIcons name="check-bold" size={44} color="#fff" />
                    </View>
                  </View>
                )}

                <View style={s.indexBadge}>
                  <Text style={s.indexText}>{index + 1}</Text>
                </View>
              </View>

              {/* Info */}
              <View style={s.info}>
                <View style={s.infoTop}>
                  <TouchableOpacity style={s.timeChip} onPress={() => onPressTime(it)} hitSlop={8}>
                    <MaterialCommunityIcons name="clock-edit-outline" size={16} color={ACCENT} />
                    <Text style={s.timeText}>{formatShortTime(it.time)}</Text>
                  </TouchableOpacity>
                  <View style={[s.badge, { backgroundColor: it.color.bg }]}>
                    <Text style={[s.badgeText, { color: it.color.stroke }]} numberOfLines={1}>{it.categoryLabel}</Text>
                  </View>
                </View>

                <View style={s.infoBottom}>
                  <Text
                    style={[s.name, done && s.nameDone]}
                    numberOfLines={2}
                  >
                    {it.label}
                  </Text>
                  {now && (
                    <TouchableOpacity style={s.doneBtn} onPress={() => onMarkDone(it)}>
                      <MaterialCommunityIcons name="check" size={20} color="#fff" />
                      <Text style={s.doneBtnText}>Hecho</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
}

const s = themedStyles(() => ({
  scroll: { flex: 1 },
  content: { paddingTop: PAD_TOP, paddingHorizontal: SIDE, paddingBottom: 110 },

  // La sombra va en el contenedor: en iOS `overflow: hidden` la recortaría.
  cardWrap: {
    height: CARD_H, marginBottom: GAP, borderRadius: 26, backgroundColor: SURFACE,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 5,
  },
  card: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 26, overflow: 'hidden',
    borderWidth: 1.5, borderColor: BORDER,
  },
  cardNow: { borderColor: ACCENT, borderWidth: 3 },

  media: { height: IMG_H, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },

  nowRibbon: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: ACCENT_FILL, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  nowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: SURFACE },
  nowRibbonText: { fontFamily: FONT_DISP, fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.6 },

  doneOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(45,38,32,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  doneBadge: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff',
  },

  indexBadge: {
    position: 'absolute', top: 14, right: 14,
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  indexText: { fontFamily: FONT_DISP, fontSize: 15, fontWeight: '800', color: INK },

  info: { height: INFO_H, paddingHorizontal: 18, paddingVertical: 14, justifyContent: 'space-between' },
  infoTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: ACCENT_SOFT, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  timeText: { fontFamily: FONT_DISP, fontSize: 16, fontWeight: '800', color: ACCENT },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, flexShrink: 1 },
  badgeText: { fontFamily: FONT_BODY, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  infoBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', color: INK, lineHeight: 30 },
  nameDone: { color: INK3, textDecorationLine: 'line-through' },
  doneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: ACCENT_FILL, borderRadius: 14, paddingHorizontal: 14, height: 44,
  },
  doneBtnText: { fontFamily: FONT_DISP, fontSize: 16, fontWeight: '800', color: '#fff' },
}));
