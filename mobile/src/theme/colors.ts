// Məcnun design tokens — single source of truth for the app.
// Mirrors docs/design/mecnun-ui-kit/rn-components/tokens.ts (the Claude Design export).
// Monochrome, dark-first. No hue anywhere; the only "accent" is white/black inversion.

export const colors = {
  bg: '#131313',
  surface: '#1D1D1F',
  botBubble: '#232326',
  ink: '#F5F5F4',
  muted: '#8E8E93',
  border: 'rgba(255,255,255,0.08)',
  borderSelected: '#F5F5F4',
  overlay: 'rgba(0,0,0,0.55)',
  lightBg: '#FAFAFA',
} as const;

/** Aliases matching the design-kit vocabulary, so kit components drop in unchanged. */
export const kitColors = {
  bg: colors.bg,
  surface: colors.surface,
  bubbleBot: colors.botBubble,
  white: colors.ink,
  textSecondary: colors.muted,
  border: colors.border,
  borderSelected: colors.borderSelected,
  overlay: colors.overlay,
  black: colors.bg, // "ink" — text on white fills
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

// Inter is loaded in App.tsx via @expo-google-fonts/inter.
// Azerbaijani glyph coverage to verify on device: ə ğ ı ş ö ü ç Ə Ğ I İ Ş Ö Ü Ç
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const type = {
  wordmark: { fontFamily: fontFamily.bold, fontSize: 40, letterSpacing: -1.2, color: colors.ink },
  title: { fontFamily: fontFamily.semibold, fontSize: 27, letterSpacing: -0.5, color: colors.ink },
  headline: { fontFamily: fontFamily.semibold, fontSize: 19, color: colors.ink },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 22, color: colors.ink },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.ink },
  secondary: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  caption: { fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.muted },
} as const;

export const bubbleMaxWidth = '82%';
