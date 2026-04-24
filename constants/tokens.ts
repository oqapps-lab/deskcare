import { Platform, TextStyle } from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  canvas:           '#f2f6f8',
  surface:          '#ffffff',
  surfaceLow:       '#eceef0',
  surfaceHighest:   '#e0e3e5',

  // Primary blue-cyan
  primary:          '#00677d',
  primaryLight:     '#00b4d8',
  primaryFixed:     '#4cd6fb',

  // Text
  onSurface:        '#191c1e',
  onSurfaceVar:     '#3d494d',
  onPrimary:        '#ffffff',

  // Outline (use at opacity 0.15 only)
  outline:          '#bcc9ce',

  // Semantic
  error:            '#ba1a1a',
  success:          '#1a6b3c',
  warning:          '#7d5700',

  // Gradient endpoints
  gradientStart:    '#00677d',
  gradientEnd:      '#00b4d8',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const FontFamily = {
  manropeBold:      'Manrope-Bold',
  manropeSemiBold:  'Manrope-SemiBold',
  manropeMedium:    'Manrope-Medium',
  interRegular:     'Inter-Regular',
  interMedium:      'Inter-Medium',
} as const;

export const Typography = {
  display: {
    fontFamily: FontFamily.manropeBold,
    fontSize: 56,
    lineHeight: 64,
    color: Colors.onSurface,
  } satisfies TextStyle,

  h1: {
    fontFamily: FontFamily.manropeBold,
    fontSize: 28,
    lineHeight: 36,
    color: Colors.onSurface,
  } satisfies TextStyle,

  h2: {
    fontFamily: FontFamily.manropeBold,
    fontSize: 22,
    lineHeight: 30,
    color: Colors.onSurface,
  } satisfies TextStyle,

  h3: {
    fontFamily: FontFamily.manropeSemiBold,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.onSurface,
  } satisfies TextStyle,

  body: {
    fontFamily: FontFamily.interRegular,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurface,
  } satisfies TextStyle,

  bodyMd: {
    fontFamily: FontFamily.interRegular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurfaceVar,
  } satisfies TextStyle,

  label: {
    fontFamily: FontFamily.interMedium,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.onSurface,
  } satisfies TextStyle,

  caption: {
    fontFamily: FontFamily.interRegular,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.onSurfaceVar,
  } satisfies TextStyle,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,  // screen horizontal padding
  xxl:  24,  // section gap
  xxxl: 32,
} as const;

// ─── Radii ───────────────────────────────────────────────────────────────────

export const Radii = {
  sm:   12,
  md:   16,
  lg:   24,  // cards (≈ 3rem)
  full: 9999, // buttons, chips, pills
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
// Only tinted ambient — no grey shadows

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: Colors.primary,
      shadowOpacity: 0.07,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) ?? {},

  float: Platform.select({
    ios: {
      shadowColor: Colors.primary,
      shadowOpacity: 0.10,
      shadowRadius: 32,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) ?? {},
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────

export const Layout = {
  screenPadding:  Spacing.xl,
  cardPadding:    Spacing.lg,
  sectionGap:     Spacing.xxl,
  cardGap:        Spacing.md,
  minTouchTarget: 44,
  headerHeight:   56,
  tabBarHeight:   64,
  bodyZoneCols:   2,
} as const;
