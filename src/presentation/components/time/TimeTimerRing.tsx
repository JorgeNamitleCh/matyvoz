import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { SURFACE } from '../../theme/tokens';

interface Props {
  /** Fracción restante 0–1 */
  progress: number;
  size?: number;
  /** Grosor de la banda roja */
  band?: number;
  color?: string;
  ink?: string;
  /** Muestra la marca "+" arriba */
  showTick?: boolean;
  children?: React.ReactNode;
}

/**
 * Anillo estilo Time Timer: aro oscuro, banda roja que representa el tiempo
 * restante (centrada arriba, se encoge hacia la marca) y círculo blanco
 * interior donde va el número.
 */
export default function TimeTimerRing({
  progress, size = 260, band, color = '#D0413F', ink = '#231B2E', showTick = true, children,
}: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const c = size / 2;
  const outerStroke = Math.max(3, size * 0.022);
  const pad = showTick ? size * 0.05 : outerStroke / 2;
  const rOuter = c - pad;
  const bandW = band ?? size * 0.085;
  const rBand = rOuter - outerStroke / 2 - bandW / 2;
  const rInner = rOuter - outerStroke / 2 - bandW;
  const circ = 2 * Math.PI * rBand;
  const arc = circ * p;
  // El trazo de un <Circle> empieza en las 3 en punto y va en sentido horario;
  // lo rotamos para que el arco quede centrado en las 12.
  const rotation = -90 - p * 180;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Fondo blanco */}
        <Circle cx={c} cy={c} r={rOuter} fill={SURFACE} />
        {/* Banda roja (tiempo restante) */}
        {p > 0 && (
          <Circle
            cx={c}
            cy={c}
            r={rBand}
            stroke={color}
            strokeWidth={bandW}
            fill="none"
            strokeDasharray={`${arc} ${circ}`}
            strokeLinecap="butt"
            transform={`rotate(${rotation} ${c} ${c})`}
          />
        )}
        {/* Aro exterior */}
        <Circle cx={c} cy={c} r={rOuter} stroke={ink} strokeWidth={outerStroke} fill="none" />
        {/* Círculo interior */}
        <Circle cx={c} cy={c} r={rInner} stroke={ink} strokeWidth={Math.max(1.5, outerStroke * 0.45)} fill={SURFACE} />
        {/* Marca "+" arriba */}
        {showTick && (
          <>
            <Line x1={c} y1={1} x2={c} y2={pad + outerStroke + bandW * 0.55} stroke={ink} strokeWidth={outerStroke * 0.8} />
            <Line x1={c - size * 0.055} y1={pad * 0.55} x2={c + size * 0.055} y2={pad * 0.55} stroke={ink} strokeWidth={outerStroke * 0.8} />
          </>
        )}
      </Svg>
      {children}
    </View>
  );
}
