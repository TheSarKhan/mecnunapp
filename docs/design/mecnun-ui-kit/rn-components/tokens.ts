// məcnun design tokens — React Native / Expo
// Monochrome dark-first system. No hue anywhere; accent = white/black inversion.

export const colors = {
  bg: '#131313',
  surface: '#1D1D1F',
  bubbleBot: '#232326',
  white: '#F5F5F4',
  textSecondary: '#8E8E93',
  border: 'rgba(255,255,255,0.08)',
  borderSelected: '#F5F5F4',
  overlay: 'rgba(0,0,0,0.55)',
  black: '#131313', // "ink" — text on white fills
} as const;

export const radii = {
  pill: 28,
  card: 16,
  cardLg: 22,
  input: 22,
  chip: 22,
  sheetTop: 28,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Requires Inter loaded via expo-font / @expo-google-fonts/inter.
// Verify glyph coverage for Azerbaijani: ə ğ ı ş ö ü ç Ə Ğ I İ Ş Ö Ü Ç
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  wordmark: { fontFamily: fontFamily.bold, fontSize: 40, letterSpacing: -1.2, color: colors.white },
  title: { fontFamily: fontFamily.semibold, fontSize: 27, letterSpacing: -0.5, color: colors.white },
  headline: { fontFamily: fontFamily.semibold, fontSize: 19, color: colors.white },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 22, color: colors.white },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.white },
  secondary: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  caption: { fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.textSecondary },
} as const;

export const bubbleMaxWidth = '82%';
