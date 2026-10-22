import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Path, Ellipse } from 'react-native-svg';
import { INK, PRIMARY, INK_ON_PASTEL, themedStyles } from '../../theme/tokens';


interface Props {
  size?: number;
  /** true = celebración (brazos arriba), false = esperando sentado */
  happy?: boolean;
  /** Anima respiración + puntos "…" */
  animate?: boolean;
}

/**
 * Pictograma de "esperar" al estilo ARASAAC: niño sentado tranquilo en una
 * silla, manos en las piernas, ojos cerrados. Respira suavemente y sobre la
 * cabeza aparecen tres puntos, uno tras otro, como "…" (esperando).
 */
export default function WaitingChild({ size = 220, happy = false, animate = true }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    if (!animate) return;
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const d = Animated.loop(
      Animated.sequence([
        ...dots.map(v => Animated.timing(v, { toValue: 1, duration: 380, useNativeDriver: true })),
        Animated.delay(500),
        Animated.parallel(dots.map(v => Animated.timing(v, { toValue: 0, duration: 300, useNativeDriver: true }))),
        Animated.delay(250),
      ]),
    );
    b.start();
    if (!happy) d.start();
    return () => {
      b.stop();
      d.stop();
    };
  }, [animate, happy, breathe, dots]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const lift = breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });
  const dotSize = size * 0.055;

  return (
    <View style={{ width: size, height: size * 1.1 }}>
      {/* Puntos "…" */}
      {!happy && (
        <View style={[st.dots, { top: size * 0.02, gap: dotSize * 0.7 }]}>
          {dots.map((v, i) => (
            <Animated.View
              key={i}
              style={{
                width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: PRIMARY,
                opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
                transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [3, 0] }) }],
              }}
            />
          ))}
        </View>
      )}

      {/* Silla (fija) */}
      <Svg width={size} height={size * 1.1} viewBox="0 0 200 220" style={StyleSheet.absoluteFill}>
        <Rect x="52" y="78" width="96" height="82" rx="12" fill="#C98B55" stroke={INK_ON_PASTEL} strokeWidth="5" />
        <Rect x="58" y="192" width="11" height="26" rx="3" fill="#C98B55" stroke={INK_ON_PASTEL} strokeWidth="4" />
        <Rect x="131" y="192" width="11" height="26" rx="3" fill="#C98B55" stroke={INK_ON_PASTEL} strokeWidth="4" />
      </Svg>

      {/* Niño (respira) */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: lift }, { scale }] }]}>
        <Svg width={size} height={size * 1.1} viewBox="0 0 200 220">
          {/* Asiento */}
          <Rect x="40" y="156" width="120" height="20" rx="7" fill="#DDA36E" stroke={INK_ON_PASTEL} strokeWidth="5" />
          {/* Piernas */}
          <Rect x="74" y="160" width="24" height="40" rx="9" fill="#3D5A80" stroke={INK_ON_PASTEL} strokeWidth="5" />
          <Rect x="102" y="160" width="24" height="40" rx="9" fill="#3D5A80" stroke={INK_ON_PASTEL} strokeWidth="5" />
          <Ellipse cx="84" cy="203" rx="16" ry="8" fill={INK} />
          <Ellipse cx="116" cy="203" rx="16" ry="8" fill={INK} />
          {/* Cuerpo */}
          <Rect x="66" y="98" width="68" height="66" rx="24" fill="#FFD34E" stroke={INK_ON_PASTEL} strokeWidth="5" />
          {happy ? (
            <>
              {/* Brazos arriba */}
              <Path d="M72 112 L48 70" stroke={INK_ON_PASTEL} strokeWidth="15" strokeLinecap="round" />
              <Path d="M72 112 L48 70" stroke="#FFD34E" strokeWidth="7" strokeLinecap="round" />
              <Path d="M128 112 L152 70" stroke={INK_ON_PASTEL} strokeWidth="15" strokeLinecap="round" />
              <Path d="M128 112 L152 70" stroke="#FFD34E" strokeWidth="7" strokeLinecap="round" />
              <Circle cx="46" cy="64" r="10" fill="#F6D1A8" stroke={INK_ON_PASTEL} strokeWidth="4.5" />
              <Circle cx="154" cy="64" r="10" fill="#F6D1A8" stroke={INK_ON_PASTEL} strokeWidth="4.5" />
            </>
          ) : (
            <>
              {/* Brazos en las piernas */}
              <Path d="M72 112 Q62 138 82 156" stroke={INK_ON_PASTEL} strokeWidth="15" strokeLinecap="round" fill="none" />
              <Path d="M72 112 Q62 138 82 156" stroke="#FFD34E" strokeWidth="7" strokeLinecap="round" fill="none" />
              <Path d="M128 112 Q138 138 118 156" stroke={INK_ON_PASTEL} strokeWidth="15" strokeLinecap="round" fill="none" />
              <Path d="M128 112 Q138 138 118 156" stroke="#FFD34E" strokeWidth="7" strokeLinecap="round" fill="none" />
              <Circle cx="86" cy="158" r="9.5" fill="#F6D1A8" stroke={INK_ON_PASTEL} strokeWidth="4.5" />
              <Circle cx="114" cy="158" r="9.5" fill="#F6D1A8" stroke={INK_ON_PASTEL} strokeWidth="4.5" />
            </>
          )}
          {/* Cabeza */}
          <Circle cx="100" cy="66" r="31" fill="#F6D1A8" stroke={INK_ON_PASTEL} strokeWidth="5" />
          {/* Pelo */}
          <Path d="M70 60 Q72 30 100 32 Q130 30 131 60 Q118 46 100 48 Q82 46 70 60 Z" fill="#5B3A29" stroke={INK_ON_PASTEL} strokeWidth="4.5" strokeLinejoin="round" />
          {happy ? (
            <>
              {/* Ojos abiertos y sonrisa grande */}
              <Circle cx="89" cy="66" r="3.8" fill={INK} />
              <Circle cx="111" cy="66" r="3.8" fill={INK} />
              <Path d="M86 78 Q100 92 114 78" stroke={INK_ON_PASTEL} strokeWidth="4.5" fill="#fff" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Ojos cerrados, calma */}
              <Path d="M83 67 Q89 72 95 67" stroke={INK_ON_PASTEL} strokeWidth="4" fill="none" strokeLinecap="round" />
              <Path d="M105 67 Q111 72 117 67" stroke={INK_ON_PASTEL} strokeWidth="4" fill="none" strokeLinecap="round" />
              <Path d="M92 81 Q100 86 108 81" stroke={INK_ON_PASTEL} strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          )}
          {/* Mejillas */}
          <Circle cx="80" cy="76" r="4.5" fill="#F4A3A3" opacity="0.7" />
          <Circle cx="120" cy="76" r="4.5" fill="#F4A3A3" opacity="0.7" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const st = themedStyles(() => ({
  dots: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', zIndex: 2 },
}));
