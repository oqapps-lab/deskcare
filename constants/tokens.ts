/**
 * DeskCare — design tokens (The Radiant Sanctuary)
 * Single source of truth for all visual values. NO inline hex anywhere else.
 * See docs/06-design/DESIGN-GUIDE.md for philosophy.
 */

export const colors = {
  // Surfaces
  canvas: '#FBF9F5',
  canvasSoft: '#FDFBF7',
  surfaceLow: '#F5F3EF',
  surfaceMid: '#EFEEEA',
  surfaceHigh: '#EAE8E4',
  surfaceHighest: '#E4E2DE',
  surfaceCard: '#FFFFFF',
  surfaceDim: '#DBDAD6',

  // Primary (coral)
  primary: '#9D431A',
  primaryMid: '#E87B4E',
  primarySoft: '#FFDBCE',
  primaryLight: '#FFB599',
  primaryDeep: '#7E2C03',
  primaryInk: '#5B1C00',

  // Secondary (warm brown-taupe + cream-peach)
  secondary: '#6A5C4D',
  secondarySoft: '#FCE8D5',
  secondaryMid: '#F3DFCC',
  secondaryDim: '#D6C3B1',

  // Tertiary (slate lavender)
  tertiary: '#64597C',
  tertiaryMid: '#9B8EB4',
  tertiarySoft: '#EADDFF',
  tertiaryDim: '#CEC0E8',

  // Text
  ink: '#1B1C1A',
  inkMuted: '#56423B',
  inkSubtle: '#89726A',
  inkHairline: 'rgba(138,114,106,0.12)',

  // Status
  error: '#BA1A1A',
  errorSoft: '#FFDAD6',

  white: '#FFFFFF',
  black: '#000000',

  // Glass
  glassFill: 'rgba(255,255,255,0.72)',
  glassFillAndroid: 'rgba(255,255,255,0.88)',
  glassBorder: 'rgba(255,255,255,0.70)',
  glassInnerHighlight: 'rgba(255,255,255,0.60)',
} as const;

export const gradients = {
  // 5-stop vertical atmospheric background (app-wide)
  atmosphere: ['#FDFBF7', '#FBF9F5', '#FCEFE5', '#F9E2D2', '#F5D9C8'] as const,

  // CTA vertical 3-stop coral
  ctaCoral: ['#FFC089', '#E87B4E', '#9D431A'] as const,

  // Peach halo — radial behind hero numbers / icons
  haloPeach: [
    'rgba(255,181,153,0.55)',
    'rgba(255,219,206,0.25)',
    'rgba(255,219,206,0)',
  ] as const,

  // Orb colors (used by OrbField with RadialGradient)
  orbCoral: 'rgba(232,123,78,0.22)',
  orbPeach: 'rgba(255,181,153,0.28)',
  orbLavender: 'rgba(155,142,180,0.18)',

  // Chip active (same as CTA, slightly smaller glow)
  chipActive: ['#FFA872', '#E87B4E', '#B5551F'] as const,

  // Toggle track on-state
  toggleOn: ['#FFA872', '#E87B4E'] as const,
} as const;

export const radii = {
  none: 0,
  xs: 10,
  sm: 14,
  md: 20,
  lg: 28,
  xl: 36,
  xxl: 44,
  pill: 999,
  icon: 24,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

export const typeScale = {
  displayXl: { fontSize: 80, lineHeight: 84, letterSpacing: -1.6, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  display: { fontSize: 56, lineHeight: 60, letterSpacing: -1.1, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  headline: { fontSize: 28, lineHeight: 34, letterSpacing: -0.3, fontFamily: 'PlusJakartaSans_700Bold' },
  headlineSm: { fontSize: 22, lineHeight: 28, letterSpacing: -0.1, fontFamily: 'PlusJakartaSans_700Bold' },
  titleLg: { fontSize: 18, lineHeight: 24, letterSpacing: 0, fontFamily: 'PlusJakartaSans_600SemiBold' },
  title: { fontSize: 16, lineHeight: 22, letterSpacing: 0, fontFamily: 'PlusJakartaSans_600SemiBold' },
  body: { fontSize: 15, lineHeight: 24, letterSpacing: 0, fontFamily: 'PlusJakartaSans_400Regular' },
  bodySm: { fontSize: 13, lineHeight: 20, letterSpacing: 0, fontFamily: 'PlusJakartaSans_400Regular' },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 0.72, fontFamily: 'PlusJakartaSans_500Medium' },
  labelSm: { fontSize: 10, lineHeight: 14, letterSpacing: 0.8, fontFamily: 'PlusJakartaSans_500Medium' },
} as const;

export const fonts = {
  thin: 'PlusJakartaSans_200ExtraLight',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const shadows = {
  soft: {
    shadowColor: '#9D431A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  lift: {
    shadowColor: '#9D431A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
  cta: {
    shadowColor: '#E87B4E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 8,
  },
  chip: {
    shadowColor: '#E87B4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  orbGlow: {
    shadowColor: '#E87B4E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 60,
    elevation: 0,
  },
} as const;

export const motion = {
  fast: 120,
  normal: 180,
  slow: 300,
  hero: 400,
  loopPulse: 1600,
} as const;

export type Colors = typeof colors;
export type Gradients = typeof gradients;
export type Radii = typeof radii;
export type Spacing = typeof spacing;
export type TypeScale = typeof typeScale;
