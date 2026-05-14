import { Platform, TextStyle } from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  canvas:           '#F8F9FA',
  surface:          '#ffffff',
  surfaceLow:       '#E2F4F8',
  surfaceHighest:   '#CDEAF1',

  // Primary blue
  primary:          '#2271B3',
  primaryLight:     '#4A9FD9',
  primaryFixed:     '#85C4EA',

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
  gradientStart:    '#2271B3',
  gradientEnd:      '#4A9FD9',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const FontFamily = {
  // Display & headlines — elegant serif
  displaySerif:     'CormorantGaramond-SemiBold',
  displaySerifLight:'CormorantGaramond-Regular',
  displaySerifItalic:'CormorantGaramond-Italic',
  // Body & labels — clean sans-serif (system fallback)
  interRegular:     'Inter-Regular',
  interMedium:      'Inter-Medium',
} as const;

export const Typography = {
  display: {
    fontFamily: FontFamily.displaySerif,
    fontSize: 56,
    lineHeight: 66,
    letterSpacing: 0.2,
    color: Colors.onSurface,
  } satisfies TextStyle,

  h1: {
    fontFamily: FontFamily.displaySerif,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0.1,
    color: Colors.onSurface,
  } satisfies TextStyle,

  h2: {
    fontFamily: FontFamily.displaySerif,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.1,
    color: Colors.onSurface,
  } satisfies TextStyle,

  h3: {
    fontFamily: FontFamily.displaySerif,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.1,
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
