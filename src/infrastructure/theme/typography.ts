// Nunito ExtraLight = the family name iOS registers for the variable font file.
// iOS uses the variable font's weight axis at runtime, so fontWeight works correctly.
// Atkinson Hyperlegible has static files per weight — works perfectly.
export const fonts = {
  heading: 'Nunito ExtraLight',   // titles, H1-H3
  button: 'Nunito ExtraLight',    // button labels, tab labels
  body: 'Atkinson Hyperlegible',  // body text, inputs, labels, descriptions
} as const;

export const typography = {
  // Font families
  fontHeading: fonts.heading,
  fontButton: fonts.button,
  fontBody: fonts.body,

  // Sizes
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeMD: 15,
  fontSizeLG: 18,
  fontSizeXL: 22,
  fontSizeXXL: 28,
  fontSizeChildBody: 20,
  fontSizeChildTitle: 26,

  // Weights
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
  fontWeightExtraBold: '800' as const,
};

export type Typography = typeof typography;
