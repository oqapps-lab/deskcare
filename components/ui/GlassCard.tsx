import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, gradients, radii, shadows, spacing } from '../../constants/tokens';

type Radius = keyof typeof radii;
type Tint = 'cream' | 'peach' | 'lavender' | 'mint' | 'coral';

interface Props {
  children: React.ReactNode;
  radius?: Radius;
  padding?: number;
  tint?: Tint;
  elevated?: boolean;
  style?: ViewStyle;
  /** Subtle diagonal gradient wash over the card interior (tone-matched). */
  innerGradient?: boolean;
  /** Small 40x40 organic blob SVG in the top-right corner (tone-matched). */
  decorativeCorner?: boolean;
}

// Lower-opacity tint washes — paired with intensity 88 BlurView gives the
// "frosted matte glass" feel the user asked for: card has its own colour but
// the atmospheric wash still shows through. White-ish cream stays on the
// higher end so its content has enough background contrast.
const TINT_FILL: Record<Tint, string> = {
  cream: 'rgba(253,251,247,0.58)',
  peach: 'rgba(255,225,210,0.50)',
  lavender: 'rgba(234,221,255,0.46)',
  mint: 'rgba(208,231,217,0.48)',
  coral: 'rgba(255,197,170,0.46)',
};

// Tone-matched hairline border colour. Pulls the card edge against the
// atmospheric backdrop so peach/coral cards no longer disappear into the
// warm orb wash.
const TINT_BORDER: Record<Tint, string> = {
  cream: 'rgba(255,255,255,0.55)',
  peach: 'rgba(232,123,78,0.22)',
  lavender: 'rgba(155,142,180,0.28)',
  mint: 'rgba(155,196,174,0.30)',
  coral: 'rgba(232,123,78,0.32)',
};

// Diagonal wash gradient (tone-matched) for the innerGradient prop.
const TINT_WASH: Record<
  Tint,
  readonly [string, string, ...string[]]
> = {
  cream: gradients.washCream as unknown as readonly [string, string, ...string[]],
  peach: gradients.washPeach as unknown as readonly [string, string, ...string[]],
  lavender: gradients.washLavender as unknown as readonly [string, string, ...string[]],
  mint: gradients.washMint as unknown as readonly [string, string, ...string[]],
  coral: gradients.washCoral as unknown as readonly [string, string, ...string[]],
};

// Top-edge sheen — visible white-cream blush along the upper third of
// every card. Pulled stronger than the previous near-invisible band so the
// glass curve actually reads.
const INNER_HIGHLIGHT = [
  'rgba(255,255,255,0.62)',
  'rgba(255,255,255,0.18)',
  'rgba(255,255,255,0)',
] as const;

// Bottom-edge darkening — soft tone-matched shadow at the lower third that
// fakes a slight inset / curvature so cards have visible volume rather than
// reading as flat rectangles.
const INNER_FLOOR: Record<Tint, readonly [string, string]> = {
  cream: ['rgba(0,0,0,0)', 'rgba(125,55,12,0.08)'],
  peach: ['rgba(0,0,0,0)', 'rgba(157,67,26,0.12)'],
  lavender: ['rgba(0,0,0,0)', 'rgba(80,60,110,0.12)'],
  mint: ['rgba(0,0,0,0)', 'rgba(48,90,68,0.12)'],
  coral: ['rgba(0,0,0,0)', 'rgba(157,67,26,0.16)'],
};

// Tone-mid for the decorative corner blob.
const TINT_DECOR: Record<Tint, string> = {
  cream: colors.primaryLight,
  peach: colors.primaryLight,
  lavender: colors.tertiaryMid,
  mint: colors.mintMid,
  coral: colors.primaryMid,
};

/**
 * Frosted-glass card.
 *  iOS: BlurView intensity 40 + tint overlay.
 *  Android: solid 88% white base (BlurView noisy on Android).
 * Inner top-edge highlight 1px for "glass" feel. Warm coral-tinted shadow.
 *
 * New props:
 *  - `tint`: cream | peach | lavender | mint | coral (inner wash color)
 *  - `innerGradient`: subtle tone-matched diagonal gradient overlay
 *  - `decorativeCorner`: small organic blob SVG in top-right
 *
 * CRITICAL: don't `flex:1` a child inside — BlurView collapses height. Use
 * explicit padding or `width:'100%'` inner View.
 */
export const GlassCard: React.FC<Props> = ({
  children,
  radius = 'lg',
  padding = spacing.xxl,
  tint = 'cream',
  elevated = true,
  style,
  innerGradient = false,
  decorativeCorner = false,
}) => {
  const r = radii[radius];
  const shadowStyle = elevated ? shadows.soft : {};

  const Overlays = (
    <>
      {innerGradient && (
        <LinearGradient
          colors={TINT_WASH[tint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: r }]}
          pointerEvents="none"
        />
      )}
      {/* Always-on bottom-edge floor — soft tone-matched shadow that gives
          every card visible volume regardless of innerGradient prop. */}
      <LinearGradient
        colors={INNER_FLOOR[tint]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: r }]}
        pointerEvents="none"
      />
      {decorativeCorner && (
        <View style={styles.decorCorner} pointerEvents="none">
          <Svg width={40} height={40} viewBox="0 0 40 40">
            <Defs>
              <RadialGradient id={`gc-decor-${tint}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={TINT_DECOR[tint]} stopOpacity="0.55" />
                <Stop offset="65%" stopColor={TINT_DECOR[tint]} stopOpacity="0.18" />
                <Stop offset="100%" stopColor={TINT_DECOR[tint]} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={22} cy={14} r={16} fill={`url(#gc-decor-${tint})`} />
            <Circle
              cx={12}
              cy={22}
              r={12}
              fill={`url(#gc-decor-${tint})`}
              opacity={0.7}
            />
          </Svg>
        </View>
      )}
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={[{ borderRadius: r }, shadowStyle, style]}>
        <BlurView
          intensity={88}
          tint="light"
          style={[styles.blur, { borderRadius: r, padding }]}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: TINT_FILL[tint], borderRadius: r },
            ]}
            pointerEvents="none"
          />
          {Overlays}
          <LinearGradient
            colors={INNER_HIGHLIGHT}
            locations={[0, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.innerHighlight, { borderRadius: r }]}
            pointerEvents="none"
          />
          {/* Crisp edge — tone-matched hairline border defines the card
              against the soft atmospheric backdrop. Critical for peach/coral
              tints which otherwise vanish into the warm orb wash. */}
          <View
            pointerEvents="none"
            style={[
              styles.hairline,
              { borderRadius: r, borderColor: TINT_BORDER[tint] },
            ]}
          />
          <View style={styles.content}>{children}</View>
        </BlurView>
      </View>
    );
  }

  // Android — semi-opaque solid
  return (
    <View
      style={[
        styles.androidCard,
        { borderRadius: r, padding, backgroundColor: colors.glassFillAndroid },
        shadowStyle,
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: TINT_FILL[tint], borderRadius: r },
        ]}
        pointerEvents="none"
      />
      {Overlays}
      <LinearGradient
        colors={INNER_HIGHLIGHT}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.innerHighlight, { borderRadius: r }]}
        pointerEvents="none"
      />
      <View
        pointerEvents="none"
        style={[styles.hairline, { borderRadius: r, borderColor: TINT_BORDER[tint] }]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
  androidCard: {
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },
  hairline: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    width: '100%',
  },
  decorCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
  },
});
