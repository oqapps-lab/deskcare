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

// Solid inner wash color applied over BlurView / base.
const TINT_FILL: Record<Tint, string> = {
  cream: colors.glassFill,
  peach: 'rgba(255,219,206,0.55)',
  lavender: 'rgba(234,221,255,0.45)',
  mint: 'rgba(200,225,210,0.48)',
  coral: 'rgba(255,197,170,0.42)',
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
          intensity={40}
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
          <View
            style={[
              styles.innerHighlight,
              { borderRadius: r },
            ]}
            pointerEvents="none"
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
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
