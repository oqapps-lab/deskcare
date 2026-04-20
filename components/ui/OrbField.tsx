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
import { gradients } from '../../constants/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Slow-drifting "lava" orb field — 3 radial blobs that glide and pulse on
 * long, non-matching periods (29s / 41s / 53s) so the background never
 * repeats. Reduces to static positions when Reduce Motion is on.
 *
 * Absolute-fill, pointerEvents="none". Uses SVG RadialGradient for true soft
 * edges (LinearGradient produces banding at these sizes).
 */
export const OrbField: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  // Three progress values on different periods so orbs never align.
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);

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
  }, [reduceMotion, p1, p2, p3]);

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
    // p1 0→1→0 (reversing). Convert to -1..1 wave then apply drift.
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

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orbCoral" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={gradients.orbCoral} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.orbCoral} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbPeach" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={gradients.orbPeach} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.orbPeach} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbLavender" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={gradients.orbLavender} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.orbLavender} stopOpacity="0" />
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
