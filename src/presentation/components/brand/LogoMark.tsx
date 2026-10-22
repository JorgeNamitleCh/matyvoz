import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  /** Color de la burbuja (sobre fondo azul de marca va en crema). */
  bubble?: string;
}

/** Logo de MatyVoz: burbuja de diálogo con los 4 colores PECS (assets/brand/matyvoz-mark.svg). */
export default function LogoMark({ size = 72, bubble = '#EFEEEA' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="200 150 624 724">
      <Path d="M318 690 L268 850 L440 720 Z" fill={bubble} stroke={bubble} strokeWidth={36} strokeLinejoin="round" />
      <Rect x={222} y={170} width={580} height={580} rx={170} fill={bubble} />
      <Rect x={292} y={240} width={200} height={200} rx={46} fill="#FFE66B" />
      <Rect x={532} y={240} width={200} height={200} rx={46} fill="#A8DC83" />
      <Rect x={292} y={480} width={200} height={200} rx={46} fill="#C9A8E2" />
      <Rect x={532} y={480} width={200} height={200} rx={46} fill="#7FC4E8" />
    </Svg>
  );
}
