/**
 * Tokens visuales de MatyVoz con modo claro y oscuro.
 *
 * Los colores son `export let`: al cambiar el modo del sistema, `applyScheme()`
 * los reasigna y quien los importa ve el valor nuevo (los imports de ES son
 * enlaces vivos). AppNavigator vuelve a montar las pantallas en ese momento.
 *
 * Los estilos se crean con `themedStyles(() => ({ ... }))` en lugar de
 * `StyleSheet.create`: se generan una vez por modo y se leen del modo activo.
 *
 * Los colores PECS (amarillo, verde, morado, azul, naranja) NO cambian en modo
 * oscuro: el texto sobre ellos debe usar su `stroke` o INK_ON_PASTEL.
 */
import { Appearance, StyleSheet } from 'react-native';

export type Scheme = 'light' | 'dark';

const LIGHT = {
  BG: '#EFEEEA',
  SURFACE: '#FFFFFF',
  SURFACE_ALT: '#F4F2EE',
  INK: '#2D2620',
  INK2: '#4a4a4a',
  INK3: '#8a8a8a',
  BORDER: 'rgba(0,0,0,0.08)',
  LINE: 'rgba(0,0,0,0.10)',
  LINE_STRONG: 'rgba(0,0,0,0.20)',
  ACCENT: '#2A5F8F',
  ACCENT_SOFT: '#EAF1F7',
  ACCENT_FILL: '#2A5F8F',
  BRAND: '#2A5F8F',
  PRIMARY: '#2D2620',
  ON_PRIMARY: '#FFFFFF',
  DANGER: '#B23B3B',
  DANGER_BG: '#FBEAEA',
  DANGER_FILL: '#B23B3B',
  OK: '#3B7D2A',
  OK_SOFT: '#D8EEDC',
  BACKDROP: 'rgba(0,0,0,0.5)',
};

const DARK: typeof LIGHT = {
  BG: '#161412',
  SURFACE: '#24211E',
  SURFACE_ALT: '#302C28',
  INK: '#F1ECE4',
  INK2: '#D2CBC1',
  INK3: '#9D968C',
  BORDER: 'rgba(255,255,255,0.10)',
  LINE: 'rgba(255,255,255,0.14)',
  LINE_STRONG: 'rgba(255,255,255,0.26)',
  ACCENT: '#7DB3E3',
  ACCENT_SOFT: '#1F3346',
  ACCENT_FILL: '#3A6E9F',
  BRAND: '#1E4870',
  PRIMARY: '#3A6E9F',
  ON_PRIMARY: '#FFFFFF',
  DANGER: '#EC7A7A',
  DANGER_BG: '#3B2323',
  DANGER_FILL: '#B84545',
  OK: '#8CCB6E',
  OK_SOFT: '#1F3825',
  BACKDROP: 'rgba(0,0,0,0.65)',
};

/** Texto oscuro fijo para usar sobre colores PECS (pasteles), en ambos modos. */
export const INK_ON_PASTEL = '#2D2620';
export const FONT_DISP = 'Nunito ExtraLight';
export const FONT_BODY = 'Atkinson Hyperlegible';

export let SCHEME: Scheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

export let BG = LIGHT.BG;
export let SURFACE = LIGHT.SURFACE;
export let SURFACE_ALT = LIGHT.SURFACE_ALT;
export let INK = LIGHT.INK;
export let INK2 = LIGHT.INK2;
export let INK3 = LIGHT.INK3;
export let BORDER = LIGHT.BORDER;
export let LINE = LIGHT.LINE;
export let LINE_STRONG = LIGHT.LINE_STRONG;
export let ACCENT = LIGHT.ACCENT;
export let ACCENT_SOFT = LIGHT.ACCENT_SOFT;
/** Fondo azul de botones/chips llenos con texto blanco (ACCENT en oscuro es claro, para textos). */
export let ACCENT_FILL = LIGHT.ACCENT_FILL;
/** Azul de marca (franja de acceso, logo): profundo en oscuro para que el blanco se lea. */
export let BRAND = LIGHT.BRAND;
export let PRIMARY = LIGHT.PRIMARY;
export let ON_PRIMARY = LIGHT.ON_PRIMARY;
export let DANGER = LIGHT.DANGER;
export let DANGER_BG = LIGHT.DANGER_BG;
/** Fondo rojo de botones llenos con texto blanco (DANGER en oscuro es claro, para textos). */
export let DANGER_FILL = LIGHT.DANGER_FILL;
export let OK = LIGHT.OK;
export let OK_SOFT = LIGHT.OK_SOFT;
export let BACKDROP = LIGHT.BACKDROP;

/** Cambia la paleta activa. Es idempotente: se puede llamar en cada render. */
export function applyScheme(next: Scheme | null | undefined): void {
  const scheme: Scheme = next === 'dark' ? 'dark' : 'light';
  SCHEME = scheme;
  const p = scheme === 'dark' ? DARK : LIGHT;
  BG = p.BG;
  SURFACE = p.SURFACE;
  SURFACE_ALT = p.SURFACE_ALT;
  INK = p.INK;
  INK2 = p.INK2;
  INK3 = p.INK3;
  BORDER = p.BORDER;
  LINE = p.LINE;
  LINE_STRONG = p.LINE_STRONG;
  ACCENT = p.ACCENT;
  ACCENT_SOFT = p.ACCENT_SOFT;
  ACCENT_FILL = p.ACCENT_FILL;
  BRAND = p.BRAND;
  PRIMARY = p.PRIMARY;
  ON_PRIMARY = p.ON_PRIMARY;
  DANGER = p.DANGER;
  DANGER_BG = p.DANGER_BG;
  DANGER_FILL = p.DANGER_FILL;
  OK = p.OK;
  OK_SOFT = p.OK_SOFT;
  BACKDROP = p.BACKDROP;
}
applyScheme(SCHEME);

/**
 * Como StyleSheet.create, pero la fábrica se evalúa con la paleta del modo
 * activo (y se guarda en caché por modo).
 */
export function themedStyles<T extends StyleSheet.NamedStyles<T>>(factory: () => T): T {
  const cache: Partial<Record<Scheme, T>> = {};
  return new Proxy({} as T, {
    get(_target, key) {
      let styles = cache[SCHEME];
      if (!styles) {
        styles = StyleSheet.create(factory());
        cache[SCHEME] = styles;
      }
      return styles[key as keyof T];
    },
  });
}
