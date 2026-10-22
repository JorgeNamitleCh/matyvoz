import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { FONT_DISP } from '../../theme/tokens';

/**
 * Copia animada del splash nativo (LaunchScreen.storyboard / splash_screen.xml):
 * mismo azul, mismo logo de 220×290 pt centrado. Mientras la app revisa la
 * sesión, los 4 cuadros giran juntos (de cuarto en cuarto de vuelta) cambiando
 * de lugar, y la burbuja "respira".
 * Al terminar se desvanece. Con "Reducir movimiento" activado no se anima.
 */

const SPLASH_BG = '#2A5F8F';
const CREAM = '#EFEEEA';

// Medidas tomadas de splash_logo@3x.png (660×870 px → 220×290 pt).
const W = 220;
const K = 152 / 580; // pt por unidad del SVG del logo (assets/brand/matyvoz-mark.svg)
const BUBBLE_X = 30.7;
const BUBBLE_Y = 5;
const TILE = 200 * K;
const GAP_X = (532 - 292) * K;
const TILE_X0 = BUBBLE_X + (292 - 222) * K;
const TILE_Y0 = BUBBLE_Y + (240 - 170) * K;

const GRID = GAP_X + TILE; // lado del bloque de 4 cuadros
// Cada cuadro en su esquina del logo; el bloque entero gira alrededor de su centro.
const TILES = [
  { color: '#FFE66B', x: 0, y: 0 },
  { color: '#A8DC83', x: GAP_X, y: 0 },
  { color: '#C9A8E2', x: 0, y: GAP_X },
  { color: '#7FC4E8', x: GAP_X, y: GAP_X },
];

const STEP_MS = 520;
const PAUSE_MS = 200;
const MIN_VISIBLE_MS = 1300;
const FADE_MS = 280;

interface Props {
  /** true mientras la app sigue cargando (revisando la sesión). */
  loading: boolean;
}

export default function AnimatedSplash({ loading }: Props) {
  const [mounted, setMounted] = useState(true);
  const step = useRef(new Animated.Value(0)).current; // 0 → 4 = una vuelta completa (4 cuartos)
  const pulse = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const shownAt = useRef(Date.now()).current;

  useEffect(() => {
    let stopped = false;
    let loop: Animated.CompositeAnimation | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (reduce || stopped) return;
      const oneStep = (to: number) =>
        Animated.sequence([
          Animated.parallel([
            Animated.timing(step, {
              toValue: to, duration: STEP_MS, easing: Easing.inOut(Easing.cubic), useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(pulse, {
                toValue: 1, duration: STEP_MS / 2, easing: Easing.out(Easing.quad), useNativeDriver: true,
              }),
              Animated.timing(pulse, {
                toValue: 0, duration: STEP_MS / 2, easing: Easing.in(Easing.quad), useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.delay(PAUSE_MS),
        ]);
      loop = Animated.loop(
        Animated.sequence([oneStep(1), oneStep(2), oneStep(3), oneStep(4),
          Animated.timing(step, { toValue: 0, duration: 0, useNativeDriver: true })]),
      );
      loop.start();
    });

    return () => {
      stopped = true;
      loop?.stop();
    };
  }, [step, pulse]);

  useEffect(() => {
    if (loading) return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: FADE_MS, useNativeDriver: true })
        .start(() => setMounted(false));
    }, wait);
    return () => clearTimeout(t);
  }, [loading, fade, shownAt]);

  if (!mounted) return null;

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const rotate = step.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '360deg'] });
  // A media vuelta el bloque se encoge un poco para no tocar los bordes de la burbuja.
  const gridScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] });

  return (
    <Animated.View style={[s.root, { opacity: fade }]} pointerEvents={loading ? 'auto' : 'none'}>
      <StatusBar barStyle="light-content" />
      <View style={s.logo} accessible accessibilityLabel="MatyVoz, cargando">
        <Animated.View style={[s.bubble, { transform: [{ scale }] }]}>
          <Svg width={W} height={200} style={StyleSheet.absoluteFill}>
            <Path
              d={tailPath()}
              fill={CREAM}
              stroke={CREAM}
              strokeWidth={36 * K}
              strokeLinejoin="round"
            />
            <Rect x={BUBBLE_X} y={BUBBLE_Y} width={580 * K} height={580 * K} rx={170 * K} fill={CREAM} />
          </Svg>
          <Animated.View style={[s.grid, { transform: [{ rotate }, { scale: gridScale }] }]}>
            {TILES.map(tile => (
              <View key={tile.color} style={[s.tile, { backgroundColor: tile.color, left: tile.x, top: tile.y }]} />
            ))}
          </Animated.View>
        </Animated.View>
        <Text style={s.name} allowFontScaling={false}>MatyVoz</Text>
      </View>
    </Animated.View>
  );
}

function tailPath(): string {
  const p = (x: number, y: number) => `${BUBBLE_X + (x - 222) * K} ${BUBBLE_Y + (y - 170) * K}`;
  return `M${p(318, 690)} L${p(268, 850)} L${p(440, 720)} Z`;
}

const s = StyleSheet.create({
  root: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: SPLASH_BG,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, elevation: 1000,
  },
  logo: { width: W, height: 290 },
  bubble: { width: W, height: 200 },
  grid: { position: 'absolute', left: TILE_X0, top: TILE_Y0, width: GRID, height: GRID },
  tile: { position: 'absolute', width: TILE, height: TILE, borderRadius: 46 * K },
  name: {
    position: 'absolute', left: 0, right: 0, top: 225.5,
    textAlign: 'center',
    fontFamily: FONT_DISP, fontWeight: '800', fontSize: 39.4, color: CREAM,
  },
});
