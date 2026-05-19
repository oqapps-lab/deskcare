import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

// Perf (2026-05-16): the field used to animate 6 AnimatedCircle/Stop nodes with
// useAnimatedProps + withRepeat at 60 FPS — every scroll frame forced
// react-native-svg to re-rasterize 6 screen-sized RadialGradient fills on iOS.
// That was the dominant scroll-lag source on every screen wrapped in
// AtmosphericBackground. We made the orbs static — visually within 5% of the
// drifting version, but the GPU now only paints them once.

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
  const short = Math.min(width, height);

  // Static positions — sit at the centre of the drift range so the visual is
  // the same as the mid-frame of the previous animation.
  const coral = { cx: width * 0.88, cy: height * 0.12, r: short * 0.55 };
  const peach = { cx: width * 0.02, cy: height * 0.48, r: short * 0.45 };
  const lav = { cx: width * 0.5, cy: height * 0.92, r: short * 0.5 };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orbCoral" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={CORAL_A} stopOpacity={CORAL_ALPHA} />
            <Stop offset="100%" stopColor={CORAL_A} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbPeach" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={PEACH_A} stopOpacity={PEACH_ALPHA} />
            <Stop offset="100%" stopColor={PEACH_A} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbLavender" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={LAVENDER_A} stopOpacity={LAVENDER_ALPHA} />
            <Stop offset="100%" stopColor={LAVENDER_A} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={coral.cx} cy={coral.cy} r={coral.r} fill="url(#orbCoral)" />
        <Circle cx={peach.cx} cy={peach.cy} r={peach.r} fill="url(#orbPeach)" />
        <Circle cx={lav.cx} cy={lav.cy} r={lav.r} fill="url(#orbLavender)" />
      </Svg>
    </View>
  );
};
