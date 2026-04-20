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

  // Mint accent (used by IconHalo/GlassCard tone='mint')
  mint: '#9BC3AE',
  mintMid: '#6BA485',
  mintSoft: '#DFECE4',

  // Text
  ink: '#1B1C1A',
  inkDeep: '#3A2420',
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

  // CTA vertical 3-stop coral (legacy — kept for any consumer still using it)
  ctaCoral: ['#FFC089', '#E87B4E', '#9D431A'] as const,

  // Modern 4-stop diagonal mesh — NW→SE, narrow warm range so white labels
  // stay legible across the whole surface. No pale top, no burnt bottom.
  ctaMesh: ['#EE8459', '#E87B4E', '#D96A3D', '#B55223'] as const,

  // Very soft gloss overlay — barely-there sheen. Previous alpha (0.32) was
  // too strong, washed out the top and killed contrast with white labels.
  ctaGloss: [
    'rgba(255,255,255,0.14)',
    'rgba(255,255,255,0.04)',
    'rgba(255,255,255,0)',
  ] as const,

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

  // Halo fills — IconHalo gradient surfaces (3-stop diagonal)
  haloCoral: ['#FFC5AA', '#FF8A5C', '#E87B4E'] as const,
  haloPeachSolid: ['#FFE8D9', '#FFC5A8', '#FFB599'] as const,
  haloLavender: ['#E8DEEF', '#D1BFDE', '#C9B8D4'] as const,
  haloMint: ['#DFECE4', '#BED8C9', '#9BC3AE'] as const,

  // Inner card washes (used with innerGradient)
  washPeach: ['rgba(255,197,170,0.18)', 'rgba(255,139,92,0.06)'] as const,
  washLavender: ['rgba(201,184,212,0.22)', 'rgba(148,123,170,0.06)'] as const,
  washCream: ['rgba(255,250,243,0.5)', 'rgba(245,225,207,0.12)'] as const,
  washMint: ['rgba(190,216,201,0.22)', 'rgba(107,164,133,0.06)'] as const,
  washCoral: ['rgba(255,139,92,0.22)', 'rgba(232,123,78,0.08)'] as const,
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
