import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedStop = Animated.createAnimatedComponent(Stop);

/**
 * Slow-drifting "lava" orb field — 3 radial blobs that glide and pulse on
 * long, non-matching periods (29s / 41s / 53s) so the background never
 * repeats. Reduces to static positions when Reduce Motion is on.
 *
 * Colour drift: each orb's centre stop slowly interpolates between two
 * tone-matched colours on very long, prime-ish periods (74s / 88s / 102s).
 * The shift is subtle (sibling hues, never crossing channels) so the
 * atmosphere reads as "alive" without becoming a disco. Intended to be
 * almost subliminal — perceived as lighting changing in a room.
 *
 * Absolute-fill, pointerEvents="none". Uses SVG RadialGradient for true soft
 * edges (LinearGradient produces banding at these sizes).
 */

// Per-orb colour drift presets — A ↔ B over the long colour periods.
const CORAL_A = '#E87B4E';
const CORAL_B = '#D9633E'; // warmer red-coral
const PEACH_A = '#FFB599';
const PEACH_B = '#FFC9A8'; // creamier peach
const LAVENDER_A = '#9B8EB4';
const LAVENDER_B = '#B0A2C9'; // lighter, faintly cooler

export const OrbField: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  // Position progress (existing behaviour).
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);

  // Colour progress — separate, much slower periods so colour and position
  // never align.
  const c1 = useSharedValue(0);
  const c2 = useSharedValue(0);
  const c3 = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    p1.value = withRepeat(
      withTiming(1, { duration: 29000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    p2.value = withRepeat(
      withTiming(1, { duration: 41000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    p3.value = withRepeat(
      withTiming(1, { duration: 53000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );

    // Colour drift loops — long, non-matching, sinusoidal. The pingpong
    // (true) means colour glides A → B → A continuously.
    c1.value = withRepeat(
      withTiming(1, { duration: 74000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    c2.value = withRepeat(
      withTiming(1, { duration: 88000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    c3.value = withRepeat(
      withTiming(1, { duration: 102000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [reduceMotion, p1, p2, p3, c1, c2, c3]);

  // Anchor positions (fraction of screen). Orbs drift ±8% of min(W,H) around these.
  const short = Math.min(width, height);
  const drift = short * 0.08;
  const radiusFlex = short * 0.05;

  // Top-right coral
  const coralBase = { cx: width * 0.88, cy: height * 0.12, r: short * 0.55 };
  // Mid-left peach
  const peachBase = { cx: width * 0.02, cy: height * 0.48, r: short * 0.45 };
  // Bottom-center lavender
  const lavBase = { cx: width * 0.5, cy: height * 0.92, r: short * 0.5 };

  const coralProps = useAnimatedProps(() => {
    const w = p1.value * 2 - 1;
    return {
      cx: coralBase.cx + drift * 0.7 * w,
      cy: coralBase.cy + drift * 0.5 * w,
      r: coralBase.r + radiusFlex * w,
    };
  });
  const peachProps = useAnimatedProps(() => {
    const w = p2.value * 2 - 1;
    return {
      cx: peachBase.cx - drift * 0.8 * w,
      cy: peachBase.cy + drift * 0.6 * w,
      r: peachBase.r + radiusFlex * 1.2 * w,
    };
  });
  const lavProps = useAnimatedProps(() => {
    const w = p3.value * 2 - 1;
    return {
      cx: lavBase.cx + drift * 0.5 * w,
      cy: lavBase.cy - drift * 0.4 * w,
      r: lavBase.r + radiusFlex * 0.9 * w,
    };
  });

  // Colour-drift props for the centre Stop of each gradient.
  const coralStopProps = useAnimatedProps(() => ({
    stopColor: interpolateColor(c1.value, [0, 1], [CORAL_A, CORAL_B]),
  }));
  const peachStopProps = useAnimatedProps(() => ({
    stopColor: interpolateColor(c2.value, [0, 1], [PEACH_A, PEACH_B]),
  }));
  const lavStopProps = useAnimatedProps(() => ({
    stopColor: interpolateColor(c3.value, [0, 1], [LAVENDER_A, LAVENDER_B]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orbCoral" cx="50%" cy="50%" r="50%">
            <AnimatedStop offset="0%" animatedProps={coralStopProps} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={CORAL_A} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbPeach" cx="50%" cy="50%" r="50%">
            <AnimatedStop offset="0%" animatedProps={peachStopProps} stopOpacity="0.28" />
            <Stop offset="100%" stopColor={PEACH_A} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbLavender" cx="50%" cy="50%" r="50%">
            <AnimatedStop offset="0%" animatedProps={lavStopProps} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={LAVENDER_A} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <AnimatedCircle
          cx={coralBase.cx}
          cy={coralBase.cy}
          r={coralBase.r}
          animatedProps={coralProps}
          fill="url(#orbCoral)"
        />
        <AnimatedCircle
          cx={peachBase.cx}
          cy={peachBase.cy}
          r={peachBase.r}
          animatedProps={peachProps}
          fill="url(#orbPeach)"
        />
        <AnimatedCircle
          cx={lavBase.cx}
          cy={lavBase.cy}
          r={lavBase.r}
          animatedProps={lavProps}
          fill="url(#orbLavender)"
        />
      </Svg>
    </View>
  );
};
