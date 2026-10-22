import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const INK = '#2D2620';
const BORDER = 'rgba(0,0,0,0.08)';
const INK3 = '#8a8a8a';
const FONT_BODY = 'Atkinson Hyperlegible';

const INACTIVE_OPACITY = 0.38;

const FULLSCREEN_ROUTES = ['StoryReader'];

interface TabCfg { icon: string; label: string; bg: string; stroke: string }

const TAB_CONFIG: Record<string, TabCfg> = {
  MiDía:     { icon: 'clock-outline',       label: 'MI DÍA',    bg: '#E8E0D0', stroke: '#2a2418' },
  Historias: { icon: 'book-open-outline',   label: 'HISTORIAS', bg: '#A8DC83', stroke: '#10210a' },
  Tiempo:    { icon: 'white-balance-sunny', label: 'TIEMPO',    bg: '#E8E0D0', stroke: '#2a2418' },
  Palabras:  { icon: 'help-circle-outline', label: 'PALABRAS',  bg: '#FFB870', stroke: '#2a1808' },
};

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter(r => r.name !== 'Settings');

  // Pantallas inmersivas (lector en modo niño) ocultan la barra de pestañas.
  const focused = state.routes[state.index];
  const nested = focused.state as { index?: number; routes: { name: string }[] } | undefined;
  const nestedName = nested ? nested.routes[nested.index ?? nested.routes.length - 1]?.name : undefined;
  if (nestedName && FULLSCREEN_ROUTES.includes(nestedName)) return null;

  return (
    <View style={s.bar}>
      {visibleRoutes.map(route => {
        const isFocused = state.index === state.routes.findIndex(r => r.name === route.name);
        const cfg = TAB_CONFIG[route.name];
        if (!cfg) return null;

        const boxStyle = {
          width: 42, height: 42, borderRadius: 12, borderWidth: 2.5,
          alignItems: 'center' as const, justifyContent: 'center' as const,
          backgroundColor: cfg.bg,
          borderColor: cfg.stroke,
          opacity: isFocused ? 1 : INACTIVE_OPACITY,
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={s.tab}
            onPress={() => { if (!isFocused) navigation.navigate(route.name); }}
            activeOpacity={0.7}
          >
            <View style={boxStyle}>
              <MaterialCommunityIcons
                name={cfg.icon}
                size={22}
                color={cfg.stroke}
              />
            </View>
            <Text style={[s.label, isFocused && s.labelActive]}>{cfg.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: BORDER,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontFamily: FONT_BODY, fontSize: 9, fontWeight: '800', letterSpacing: 0.3, color: INK3 },
  labelActive: { color: INK },
});
