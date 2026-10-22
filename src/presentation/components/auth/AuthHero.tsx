import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LogoMark from '../brand/LogoMark';
import { BRAND, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

interface Props {
  /** Solo se muestra en modo compact; en grande el título es la marca. */
  title?: string;
  subtitle: string;
  /** compact = logo pequeño en fila (Crear cuenta); si no, logo grande centrado (Login). */
  compact?: boolean;
  onBack?: () => void;
}

/** Franja azul de marca de las pantallas de acceso; la tarjeta del formulario se monta encima. */
export default function AuthHero({ title, subtitle, compact, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.hero, { paddingTop: insets.top + (compact ? 8 : 36) }, compact && s.heroCompact]}>
      <StatusBar barStyle="light-content" />

      {/* Tiles decorativos muy tenues, eco de los 4 colores del logo */}
      <View style={[s.deco, s.deco1]} />
      <View style={[s.deco, s.deco2]} />
      <View style={[s.deco, s.deco3]} />

      {onBack && (
        <TouchableOpacity style={s.backBtn} onPress={onBack} accessibilityLabel="Volver">
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {compact ? (
        <View style={s.compactRow}>
          <LogoMark size={52} />
          <View style={s.flex}>
            <Text style={s.titleCompact}>{title}</Text>
            <Text style={s.subtitle}>{subtitle}</Text>
          </View>
        </View>
      ) : (
        <View style={s.center}>
          <LogoMark size={92} />
          <Text style={s.brand}>MatyVoz</Text>
          <Text style={[s.subtitle, s.subtitleCenter]}>{subtitle}</Text>
        </View>
      )}
    </View>
  );
}

const s = themedStyles(() => ({
  hero: {
    backgroundColor: BRAND,
    paddingHorizontal: 24, paddingBottom: 64,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroCompact: { paddingBottom: 56 },
  flex: { flex: 1 },

  deco: { position: 'absolute', borderRadius: 28, opacity: 0.1 },
  deco1: { backgroundColor: '#FFE66B', width: 110, height: 110, bottom: 30, right: -48, transform: [{ rotate: '16deg' }] },
  deco2: { backgroundColor: '#A8DC83', width: 90, height: 90, bottom: 70, left: -40, transform: [{ rotate: '-14deg' }] },
  deco3: { backgroundColor: '#C9A8E2', width: 54, height: 54, borderRadius: 16, bottom: 6, left: 70, transform: [{ rotate: '22deg' }] },

  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },

  center: { alignItems: 'center' },
  brand: { fontFamily: FONT_DISP, fontSize: 34, fontWeight: '800', color: '#fff', marginTop: 10, letterSpacing: -0.5 },
  subtitle: { fontFamily: FONT_BODY, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 20, marginTop: 4 },
  subtitleCenter: { textAlign: 'center', maxWidth: 280 },

  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  titleCompact: { fontFamily: FONT_DISP, fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
}));
