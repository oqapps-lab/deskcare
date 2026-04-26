import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, gradients } from '../../constants/tokens';
import { Glyph, GlyphName } from './Glyph';

export type HaloTone = 'coral' | 'peach' | 'lavender' | 'mint';
export type HaloSize = 'sm' | 'md' | 'lg' | 'xl';
export type HaloVariant = 'gradient' | 'tinted' | 'glass' | 'aura';

interface Props {
  icon: GlyphName | React.ReactNode;
  size?: HaloSize;
  tone?: HaloTone;
  glow?: boolean;
  variant?: HaloVariant;
}

const SIZE_MAP: Record<HaloSize, number> = {
  sm: 36,
  md: 52,
  lg: 72,
  xl: 96,
};

// 3-stop diagonal gradients per tone
const GRADIENT_MAP: Record<HaloTone, readonly [string, string, ...string[]]> = {
  coral: gradients.haloCoral as unknown as readonly [string, string, ...string[]],
  peach: gradients.haloPeachSolid as unknown as readonly [string, string, ...string[]],
  lavender: gradients.haloLavender as unknown as readonly [string, string, ...string[]],
  mint: gradients.haloMint as unknown as readonly [string, string, ...string[]],
};

// Tone-mid color for tinted/glass icon color + halo stroke
const TONE_MID_MAP: Record<HaloTone, string> = {
  coral: colors.primaryMid,
  peach: colors.primaryLight,
  lavender: colors.tertiaryMid,
  mint: colors.mintMid,
};

// Tone-deep color for `aura` variant icon stroke — bolder than tone-mid.
const TONE_DEEP_MAP: Record<HaloTone, string> = {
  coral: colors.primaryDeep,
  peach: colors.primary,
  lavender: colors.tertiary,
  mint: colors.mintMid,
};

// Solid fill base used for tinted variant (~20% alpha)
const TINTED_FILL_MAP: Record<HaloTone, string> = {
  coral: 'rgba(232,123,78,0.20)',
  peach: 'rgba(255,181,153,0.22)',
  lavender: 'rgba(201,184,212,0.24)',
  mint: 'rgba(155,195,174,0.22)',
};

// Glass overlay tint on top of BlurView
const GLASS_TINT_MAP: Record<HaloTone, string> = {
  coral: 'rgba(255,181,153,0.28)',
  peach: 'rgba(255,219,206,0.35)',
  lavender: 'rgba(234,221,255,0.35)',
  mint: 'rgba(190,216,201,0.32)',
};

/**
 * IconHalo — decorative icon container in a circle.
 *  - `gradient`: 3-stop diagonal gradient + top-left inner highlight (white icon).
 *  - `tinted`:   solid tone at 20% alpha over surface (tone-mid icon).
 *  - `glass`:    BlurView + tone-tinted overlay (tone-mid icon).
 *  - `aura`:     no disc body — soft warm radial glow + bold tone-deep icon. Used
 *                for hero "stamps" (Permission bell, Milestone "7", Force-Update
 *                arrow) so they read as elegant marks, not pasted-on disks.
 *  - `glow`:     outer breathing halo ring (2.4s loop; fades-only on reduce motion).
 *
 * Sizes: sm=36, md=52, lg=72, xl=96. Border-radius = size/2.
 */
export const IconHalo: React.FC<Props> = ({
  icon,
  size = 'md',
  tone = 'coral',
  glow = true,
  variant = 'gradient',
}) => {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    if (!glow) return;
    if (reduceMotion) {
      // On reduced motion: hold a steady mid-opacity halo rather than pulse.
      pulse.value = withTiming(0.45, { duration: 300 });
      return;
    }
    pulse.value = withRepeat(
      withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [glow, reduceMotion, pulse]);

  const haloStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const px = SIZE_MAP[size];
  const radius = px / 2;
  const iconSize = Math.round(px * 0.44);
  const haloSize = Math.round(px * 1.7);
  const haloOffset = (haloSize - px) / 2;

  const iconColor =
    variant === 'gradient'
      ? colors.white
      : variant === 'aura'
        ? TONE_DEEP_MAP[tone]
        : TONE_MID_MAP[tone];

  // Render icon — accept GlyphName string or a ReactNode
  const iconNode =
    typeof icon === 'string' ? (
      <Glyph name={icon as GlyphName} size={iconSize} color={iconColor} />
    ) : (
      icon
    );

  return (
    <View style={[styles.wrap, { width: px, height: px }]}>
      {/* Outer breathing halo ring */}
      {glow && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.haloLayer,
            {
              width: haloSize,
              height: haloSize,
              left: -haloOffset,
              top: -haloOffset,
            },
            haloStyle,
          ]}
        >
          <Svg width={haloSize} height={haloSize}>
            <Defs>
              <RadialGradient
                id={`icon-halo-${tone}-${size}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <Stop offset="0%" stopColor={TONE_MID_MAP[tone]} stopOpacity="0.45" />
                <Stop offset="55%" stopColor={TONE_MID_MAP[tone]} stopOpacity="0.18" />
                <Stop offset="100%" stopColor={TONE_MID_MAP[tone]} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle
              cx={haloSize / 2}
              cy={haloSize / 2}
              r={haloSize / 2}
              fill={`url(#icon-halo-${tone}-${size})`}
            />
          </Svg>
        </Animated.View>
      )}

      {/* Disc body — `aura` variant skips the disc entirely; only the halo
          + the icon are drawn, so it reads as a soft warm mark instead of a
          stamped-on coral disk. */}
      <View
        style={[
          styles.disc,
          {
            width: px,
            height: px,
            borderRadius: radius,
            backgroundColor:
              variant === 'tinted'
                ? TINTED_FILL_MAP[tone]
                : 'transparent',
          },
        ]}
      >
        {variant === 'gradient' && (
          <LinearGradient
            colors={GRADIENT_MAP[tone]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          />
        )}

        {variant === 'glass' && Platform.OS === 'ios' && (
          <BlurView
            intensity={32}
            tint="light"
            style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: GLASS_TINT_MAP[tone], borderRadius: radius },
              ]}
              pointerEvents="none"
            />
          </BlurView>
        )}
        {variant === 'glass' && Platform.OS !== 'ios' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: colors.glassFillAndroid,
                borderRadius: radius,
              },
            ]}
            pointerEvents="none"
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: GLASS_TINT_MAP[tone], borderRadius: radius },
              ]}
              pointerEvents="none"
            />
          </View>
        )}

        {/* Inner highlight top-left — for variants that have a disc body.
            `aura` has no disc, so suppress this highlight too. */}
        {variant !== 'aura' && (
          <View
            pointerEvents="none"
            style={[
              styles.innerHighlight,
              {
                width: px,
                height: px,
                borderRadius: radius,
              },
            ]}
          />
        )}

        {/* Icon */}
        <View style={styles.iconLayer}>{iconNode}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  iconLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
