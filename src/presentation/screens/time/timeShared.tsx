import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DayItem } from '../../stores/useDayStore';
import { SCHEME, BG, SURFACE, INK, INK2, INK3, BORDER, ACCENT, ACCENT_FILL, PRIMARY, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

// ── Tokens de las pantallas de Tiempo (según diseño) ───────────────────────
export const T = {
  get BG() { return BG; },
  get CARD() { return SURFACE; },
  /** En modo claro, la tinta de estas pantallas es un poco morada (según diseño). */
  get INK() { return SCHEME === 'dark' ? INK : '#231B2E'; },
  get PRIMARY() { return SCHEME === 'dark' ? PRIMARY : '#231B2E'; },
  get INK2() { return INK2; },
  get INK3() { return INK3; },
  get BORDER() { return BORDER; },
  get ACCENT() { return ACCENT; },
  get ACCENT_FILL() { return ACCENT_FILL; },
  /** Tinta fija para texto sobre colores pastel (TILE / INFO_BG), igual en ambos modos. */
  ON_PASTEL: '#231B2E',
  RED: '#D0413F',
  INFO_BG: '#7FC4E8',
  FONT_DISP,
  FONT_BODY,
};

export const TILE = {
  green:  { bg: '#A8DC83', stroke: '#10210a' },
  orange: { bg: '#FFB870', stroke: '#2a1808' },
  blue:   { bg: '#7FC4E8', stroke: '#0a1a2a' },
  purple: { bg: '#C9A8E2', stroke: '#1a0a2a' },
};

// ── Tiempo ──────────────────────────────────────────────────────────────────
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const nowMin = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

/** 110 → "1 h 50 min" · 45 → "45 min" */
export function fmtDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h} h ${r} min`;
  if (h) return `${h} h`;
  return `${r} min`;
}

/** "17:30" → "17:30" (24 h, como en el diseño) */
export const fmtClock = (hhmm: string) => hhmm;

/** Actividad actual ("ahora") y la siguiente pendiente de Mi día. */
export function getNowAndNext(items: DayItem[]): { now?: DayItem; next?: DayItem; later: DayItem[] } {
  const nowIdx = items.findIndex(it => it.state === 'now');
  const clock = nowMin();
  // Sin "ahora" (antes de la primera, o la actual ya se marcó hecha):
  // lo siguiente es la primera que aún no llega.
  const from = nowIdx >= 0 ? nowIdx + 1 : items.findIndex(it => toMin(it.time) > clock);
  const rest = from >= 0 ? items.slice(from).filter(it => it.state !== 'done') : [];
  return { now: nowIdx >= 0 ? items[nowIdx] : undefined, next: rest[0], later: rest };
}

// ── Barra superior de las herramientas ────────────────────────────────────
export function ToolTopBar({
  title, onBack, rightIcon, onRight,
}: { title: string; onBack: () => void; rightIcon?: string; onRight?: () => void }) {
  return (
    <View style={s.topBar}>
      <TouchableOpacity style={s.topBtn} onPress={onBack} accessibilityLabel="Regresar">
        <MaterialCommunityIcons name="arrow-left" size={22} color={T.INK} />
      </TouchableOpacity>
      <Text style={s.topTitle}>{title}</Text>
      {rightIcon ? (
        <TouchableOpacity style={s.topBtn} onPress={onRight}>
          <MaterialCommunityIcons name={rightIcon} size={20} color={T.INK} />
        </TouchableOpacity>
      ) : (
        <View style={s.topSpacer} />
      )}
    </View>
  );
}

const s = themedStyles(() => ({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14,
  },
  topBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: T.CARD,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: T.BORDER,
  },
  topSpacer: { width: 44 },
  topTitle: { fontFamily: T.FONT_BODY, fontSize: 17, fontWeight: '800', color: T.INK },
}));
