import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BG, SURFACE, INK, INK3, BORDER, LINE, PRIMARY, FONT_DISP, FONT_BODY, themedStyles } from '../../theme/tokens';

/**
 * Selector de hora visual pensado para mamás/cuidadores: en vez de listas
 * de números, primero se elige el momento del día (con ícono y color) y
 * luego la hora con botones grandes en formato de 12 h ("5:00 de la tarde").
 * Internamente siempre trabaja con "HH:MM" en 24 h.
 */

type PeriodKey = 'manana' | 'mediodia' | 'tarde' | 'noche';

interface Period {
  key: PeriodKey;
  label: string;
  suffix: string;
  icon: string;
  bg: string;
  stroke: string;
  hours: number[];
}

const PERIODS: Period[] = [
  { key: 'manana',   label: 'Mañana',   suffix: 'de la mañana', icon: 'weather-sunset-up',    bg: '#FFE66B', stroke: '#1f1a0a', hours: [6, 7, 8, 9, 10, 11] },
  { key: 'mediodia', label: 'Mediodía', suffix: 'del mediodía', icon: 'white-balance-sunny',  bg: '#FFB870', stroke: '#2a1808', hours: [12, 13, 14] },
  { key: 'tarde',    label: 'Tarde',    suffix: 'de la tarde',  icon: 'weather-sunset-down',  bg: '#F5A8C0', stroke: '#2a0a1a', hours: [15, 16, 17, 18, 19] },
  { key: 'noche',    label: 'Noche',    suffix: 'de la noche',  icon: 'moon-waning-crescent', bg: '#7FC4E8', stroke: '#0a1a2a', hours: [20, 21, 22, 23] },
];

const MINUTES = [0, 15, 30, 45];
const STEP = 15;

const pad = (n: number) => String(n).padStart(2, '0');

function parse(value: string): { h: number; m: number } {
  const [h, m] = value.split(':').map(Number);
  return { h: Number.isFinite(h) ? h : 17, m: Number.isFinite(m) ? m : 0 };
}

function periodOf(h: number): Period {
  if (h >= 6 && h <= 11) return PERIODS[0];
  if (h >= 12 && h <= 14) return PERIODS[1];
  if (h >= 15 && h <= 19) return PERIODS[2];
  return PERIODS[3]; // 20–5
}

const h12 = (h: number) => h % 12 || 12;

/** "17:30" → "5:30 de la tarde" */
export function formatFriendlyTime(value: string): string {
  const { h, m } = parse(value);
  return `${h12(h)}:${pad(m)} ${periodOf(h).suffix}`;
}

/** "17:30" → "5:30 pm" (para etiquetas compactas) */
export function formatShortTime(value: string): string {
  const { h, m } = parse(value);
  return `${h12(h)}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;
}

/** Próxima hora en punto a partir de ahora, en "HH:MM". */
export function nextRoundHour(): string {
  const d = new Date();
  return `${pad((d.getHours() + 1) % 24)}:00`;
}

interface Props {
  /** "HH:MM" en 24 h */
  value: string;
  onChange: (value: string) => void;
}

export default function TimeOfDayPicker({ value, onChange }: Props) {
  const { h, m } = parse(value);
  const period = periodOf(h);

  const set = (hour: number, minute: number) => onChange(`${pad(hour)}:${pad(minute)}`);

  const step = (delta: number) => {
    const total = (h * 60 + m + delta + 24 * 60) % (24 * 60);
    set(Math.floor(total / 60), total % 60);
  };

  const choosePeriod = (p: Period) => {
    if (p.key === period.key) return;
    set(p.hours[0], m);
  };

  return (
    <View>
      {/* Hora grande + ajuste fino */}
      <View style={[s.display, { backgroundColor: period.bg, borderColor: period.stroke }]}>
        <TouchableOpacity
          style={s.stepBtn}
          onPress={() => step(-STEP)}
          accessibilityLabel="15 minutos antes"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="minus" size={28} color={INK} />
        </TouchableOpacity>

        <View style={s.displayCenter}>
          <MaterialCommunityIcons name={period.icon} size={26} color={period.stroke} />
          <Text style={[s.displayTime, { color: period.stroke }]}>{h12(h)}:{pad(m)}</Text>
          <Text style={[s.displaySuffix, { color: period.stroke }]}>{period.suffix}</Text>
        </View>

        <TouchableOpacity
          style={s.stepBtn}
          onPress={() => step(STEP)}
          accessibilityLabel="15 minutos después"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="plus" size={28} color={INK} />
        </TouchableOpacity>
      </View>

      {/* Momento del día */}
      <Text style={s.question}>Momento del día</Text>
      <View style={s.periodRow}>
        {PERIODS.map(p => {
          const active = p.key === period.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                s.periodTile,
                { backgroundColor: active ? p.bg : SURFACE, borderColor: active ? p.stroke : BORDER },
                active && s.periodTileActive,
              ]}
              onPress={() => choosePeriod(p)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <MaterialCommunityIcons name={p.icon} size={30} color={active ? p.stroke : INK3} />
              <Text style={[s.periodLabel, { color: active ? p.stroke : INK }]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Horas del momento elegido */}
      <Text style={s.question}>Hora</Text>
      <View style={s.hourGrid}>
        {period.hours.map(hour => {
          const active = hour === h;
          return (
            <TouchableOpacity
              key={hour}
              style={[s.hourBtn, active && { backgroundColor: PRIMARY, borderColor: PRIMARY }]}
              onPress={() => set(hour, m)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[s.hourText, active && s.hourTextActive]}>{h12(hour)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Minutos */}
      <View style={s.minuteRow}>
        {MINUTES.map(min => {
          const active = min === m;
          return (
            <TouchableOpacity
              key={min}
              style={[s.minuteBtn, active && { backgroundColor: PRIMARY, borderColor: PRIMARY }]}
              onPress={() => set(h, min)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[s.minuteText, active && s.hourTextActive]}>
                {min === 0 ? 'en punto' : min === 30 ? 'y media' : `:${pad(min)}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = themedStyles(() => ({
  display: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 18, borderWidth: 2.5, paddingVertical: 14, paddingHorizontal: 12,
  },
  stepBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: SURFACE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: LINE,
  },
  displayCenter: { alignItems: 'center', flex: 1 },
  displayTime: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 46, lineHeight: 52 },
  displaySuffix: { fontFamily: FONT_BODY, fontWeight: '700', fontSize: 15 },

  question: {
    fontFamily: FONT_BODY, fontWeight: '800', fontSize: 12, letterSpacing: 0.4,
    color: INK3, marginTop: 16, marginBottom: 8, textTransform: 'uppercase',
  },

  periodRow: { flexDirection: 'row', gap: 8 },
  periodTile: {
    flex: 1, height: 88, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  periodTileActive: { borderWidth: 2.5 },
  periodLabel: { fontFamily: FONT_BODY, fontWeight: '800', fontSize: 13 },

  hourGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hourBtn: {
    width: '31.5%', height: 60, borderRadius: 14,
    backgroundColor: SURFACE, borderWidth: 2, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  hourText: { fontFamily: FONT_DISP, fontWeight: '800', fontSize: 26, color: INK },
  hourTextActive: { color: '#fff' },

  minuteRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  minuteBtn: {
    flex: 1, height: 48, borderRadius: 12,
    backgroundColor: BG, borderWidth: 2, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  minuteText: { fontFamily: FONT_BODY, fontWeight: '800', fontSize: 14, color: INK },
}));
