import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Slow-drifting "lava" orb field — 3 radial blobs that glide and pulse on
 * long, non-matching periods (29s / 41s / 53s) so the background never
 * repeats. Reduces to static positions when Reduce Motion is on.
 *
 * Colour drift: each of the 3 channels (coral / peach / lavender) is
 * actually two stacked orbs with sibling-hue radial gradients. We crossfade
 * their opacity on long, non-aligning periods (74s / 88s / 102s) so the
 * apparent centre colour glides A → B → A continuously. Both gradients fade
 * to 0 alpha at the rim, so soft edges always hold.
 *
 * Avoids animating <Stop> directly — that crashes Reanimated since Stop
 * isn't a host component. Each AnimatedCircle receives a single
 * animatedProps that bundles position + opacity together.
 *
 * Absolute-fill, pointerEvents="none".
 */

// Wider sibling pairs so the colour drift is genuinely visible rather than
// a sub-perceptual nudge. Each pair stays in-channel (coral / peach / soft
// lavender) so the atmosphere doesn't whiplash hue.
const CORAL_A = '#E87B4E';
const CORAL_B = '#FF9F6B';
const PEACH_A = '#FFB599';
const PEACH_B = '#FFD2A8';
const LAVENDER_A = '#9B8EB4';
const LAVENDER_B = '#C2B0DC';

// Slightly stronger alphas — the sum of two crossfading orbs at any instant
// equals one orb at peak, so the visible intensity is preserved.
const CORAL_ALPHA = '0.28';
const PEACH_ALPHA = '0.32';
const LAVENDER_ALPHA = '0.22';

export const OrbField: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);
  const c1 = useSharedValue(0);
  const c2 = useSharedValue(0);
  const c3 = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    // Position drift periods — sped up so the motion is actually noticeable
    // within ~10s of looking. Still non-aligning so the field never repeats.
    p1.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    p2.value = withRepeat(
      withTiming(1, { duration: 22000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    p3.value = withRepeat(
      withTiming(1, { duration: 28000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    // Colour drift — kept slow per the brief ("чуть-чуть очень медленно
    // перетекали"), but still aligned to be perceptible inside a minute.
    c1.value = withRepeat(
      withTiming(1, { duration: 40000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    c2.value = withRepeat(
      withTiming(1, { duration: 50000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    c3.value = withRepeat(
      withTiming(1, { duration: 60000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduceMotion, p1, p2, p3, c1, c2, c3]);

  const short = Math.min(width, height);
  // Wider drift (was 8% / 5%) so position movement is actually visible.
  const drift = short * 0.16;
  const radiusFlex = short * 0.10;

  const coralBase = { cx: width * 0.88, cy: height * 0.12, r: short * 0.55 };
  const peachBase = { cx: width * 0.02, cy: height * 0.48, r: short * 0.45 };
  const lavBase = { cx: width * 0.5, cy: height * 0.92, r: short * 0.5 };

  // Each AnimatedCircle bundles position drift + crossfade opacity into one
  // animatedProps payload. Two circles per channel: A (opacity = 1 - c) and
  // B (opacity = c).

  const coralA = useAnimatedProps(() => {
    const w = p1.value * 2 - 1;
    return {
      cx: coralBase.cx + drift * 0.7 * w,
      cy: coralBase.cy + drift * 0.5 * w,
      r: coralBase.r + radiusFlex * w,
      opacity: 1 - c1.value,
    };
  });
  const coralB = useAnimatedProps(() => {
    const w = p1.value * 2 - 1;
    return {
      cx: coralBase.cx + drift * 0.7 * w,
      cy: coralBase.cy + drift * 0.5 * w,
      r: coralBase.r + radiusFlex * w,
      opacity: c1.value,
    };
  });

  const peachA = useAnimatedProps(() => {
    const w = p2.value * 2 - 1;
    return {
      cx: peachBase.cx - drift * 0.8 * w,
      cy: peachBase.cy + drift * 0.6 * w,
      r: peachBase.r + radiusFlex * 1.2 * w,
      opacity: 1 - c2.value,
    };
  });
  const peachB = useAnimatedProps(() => {
    const w = p2.value * 2 - 1;
    return {
      cx: peachBase.cx - drift * 0.8 * w,
      cy: peachBase.cy + drift * 0.6 * w,
      r: peachBase.r + radiusFlex * 1.2 * w,
      opacity: c2.value,
    };
  });

  const lavA = useAnimatedProps(() => {
    const w = p3.value * 2 - 1;
    return {
      cx: lavBase.cx + drift * 0.5 * w,
      cy: lavBase.cy - drift * 0.4 * w,
      r: lavBase.r + radiusFlex * 0.9 * w,
      opacity: 1 - c3.value,
    };
  });
  const lavB = useAnimatedProps(() => {
    const w = p3.value * 2 - 1;
    return {
      cx: lavBase.cx + drift * 0.5 * w,
      cy: lavBase.cy - drift * 0.4 * w,
      r: lavBase.r + radiusFlex * 0.9 * w,
      opacity: c3.value,
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orbCoralA" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={CORAL_A} stopOpacity={CORAL_ALPHA} />
            <Stop offset="100%" stopColor={CORAL_A} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbCoralB" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={CORAL_B} stopOpacity={CORAL_ALPHA} />
            <Stop offset="100%" stopColor={CORAL_B} stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="orbPeachA" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={PEACH_A} stopOpacity={PEACH_ALPHA} />
            <Stop offset="100%" stopColor={PEACH_A} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbPeachB" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={PEACH_B} stopOpacity={PEACH_ALPHA} />
            <Stop offset="100%" stopColor={PEACH_B} stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="orbLavenderA" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={LAVENDER_A} stopOpacity={LAVENDER_ALPHA} />
            <Stop offset="100%" stopColor={LAVENDER_A} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbLavenderB" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={LAVENDER_B} stopOpacity={LAVENDER_ALPHA} />
            <Stop offset="100%" stopColor={LAVENDER_B} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <AnimatedCircle
          cx={coralBase.cx}
          cy={coralBase.cy}
          r={coralBase.r}
          animatedProps={coralA}
          fill="url(#orbCoralA)"
        />
        <AnimatedCircle
          cx={coralBase.cx}
          cy={coralBase.cy}
          r={coralBase.r}
          animatedProps={coralB}
          fill="url(#orbCoralB)"
        />

        <AnimatedCircle
          cx={peachBase.cx}
          cy={peachBase.cy}
          r={peachBase.r}
          animatedProps={peachA}
          fill="url(#orbPeachA)"
        />
        <AnimatedCircle
          cx={peachBase.cx}
          cy={peachBase.cy}
          r={peachBase.r}
          animatedProps={peachB}
          fill="url(#orbPeachB)"
        />

        <AnimatedCircle
          cx={lavBase.cx}
          cy={lavBase.cy}
          r={lavBase.r}
          animatedProps={lavA}
          fill="url(#orbLavenderA)"
        />
        <AnimatedCircle
          cx={lavBase.cx}
          cy={lavBase.cy}
          r={lavBase.r}
          animatedProps={lavB}
          fill="url(#orbLavenderB)"
        />
      </Svg>
    </View>
  );
};
