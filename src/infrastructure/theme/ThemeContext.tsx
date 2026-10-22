import React, { createContext, useContext } from 'react';
import { colors, Colors } from './colors';
import { typography, Typography } from './typography';
import { spacing, borderRadius, Spacing, BorderRadius } from './spacing';

interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
}

const theme: Theme = { colors, typography, spacing, borderRadius };

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
