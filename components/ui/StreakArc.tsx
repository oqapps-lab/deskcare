import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colors, fonts, typeScale } from '../../constants/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Geometry — 280° arc opening downward (the "horseshoe" feel reads as a
// horizon, not a generic donut). All measurements relative to a 200x200
// viewBox so the SVG scales cleanly to any container size.
const VIEWBOX = 200;
const CENTER = 100;
const RADIUS = 78;
const PROGRESS_STROKE = 9;
const TRACK_STROKE = 5;
const SWEEP = 280;
const START_ANGLE = 130; // bottom-left corner
const END_ANGLE = (START_ANGLE + SWEEP) % 360; // 50 — bottom-right

// Polar → cartesian helper. Note: SVG y-axis is flipped, and we offset by
// −90° so 0° points "up" (north) — matches how clock-style progress reads.
const polar = (angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(rad),
    y: CENTER + RADIUS * Math.sin(rad),
  };
};

const ARC_LENGTH = 2 * Math.PI * RADIUS * (SWEEP / 360);
const TRACK_START = polar(START_ANGLE);
const TRACK_END = polar(END_ANGLE);
// Sweep > 180 → large-arc-flag = 1; we sweep clockwise → sweep-flag = 1.
const TRACK_PATH = `M ${TRACK_START.x} ${TRACK_START.y} A ${RADIUS} ${RADIUS} 0 1 1 ${TRACK_END.x} ${TRACK_END.y}`;

interface Props {
  /** Streak value, e.g. 6. Numeric so we can compute progress against `total`. */
  value: number;
  /** Capacity for the arc — defaults to 14, matching the "quiet 14-day program". */
  total?: number;
  /** Outer pixel size of the SVG. Default 168 fits comfortably in a card row. */
  size?: number;
  /** Eyebrow + caption shown stacked below the number, inside the arc. */
  caption?: string;
}

/**
 * StreakArc — a 280° "horizon" progress arc with a glowing ember at the
 * leading edge. The arc draws in once on mount with an out-cubic ease, the
 * leading tip then settles into a slow breath (3.2s) so the moment lives
 * but doesn't fidget. The big serif streak number sits centred.
 *
 * Designed as the hero element on Home — replaces the previous "big number
 * + 7 dots in a peach rectangle" composition that read as a generic widget.
 */
export const StreakArc: React.FC<Props> = ({
  value,
  total = 14,
  size = 168,
  caption,
}) => {
  const reduceMotion = useReducedMotion();
  const progress = Math.max(0, Math.min(1, value / total));
  const targetOffset = ARC_LENGTH * (1 - progress);

  const draw = useSharedValue(reduceMotion ? targetOffset : ARC_LENGTH);
  const breath = useSharedValue(1);

  useEffect(() => {
    draw.value = withTiming(targetOffset, {
      duration: reduceMotion ? 200 : 950,
      easing: Easing.out(Easing.cubic),
    });
    if (reduceMotion) return;
    breath.value = withRepeat(
      withTiming(1.18, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [targetOffset, reduceMotion, draw, breath]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: draw.value,
  }));

  // Animate radius (not transform: scale) — Reanimated for SVG handles `r`
  // cleanly and keeps the dot centred without origin gymnastics.
  const dotHaloProps = useAnimatedProps(() => ({ r: 7 * breath.value }));
  const dotCoreProps = useAnimatedProps(() => ({ r: 3.2 * breath.value }));

  // Where the progress arc currently terminates — the leading-edge ember.
  const leadAngle = (START_ANGLE + SWEEP * progress) % 360;
  const lead = polar(leadAngle);

  const showLead = progress > 0 && progress < 1;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      >
        <Defs>
          <SvgLinearGradient id="streak-arc-fill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF9F6B" />
            <Stop offset="1" stopColor="#E87B4E" />
          </SvgLinearGradient>
          <RadialGradient id="streak-ember-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFB599" stopOpacity="0.40" />
            <Stop offset="55%" stopColor="#E87B4E" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#E87B4E" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Soft warm ember sitting under the number — gives the arc a
            centre of gravity. */}
        <Circle cx={CENTER} cy={CENTER} r={62} fill="url(#streak-ember-glow)" />

        {/* Track — full 280° arc at hairline weight so the path is implied
            even before any progress. */}
        <Path
          d={TRACK_PATH}
          stroke={colors.primaryDeep}
          strokeOpacity={0.10}
          strokeWidth={TRACK_STROKE}
          strokeLinecap="round"
          fill="none"
        />

        {/* Progress — same path, animated stroke-dashoffset draws it in. */}
        <AnimatedPath
          d={TRACK_PATH}
          stroke="url(#streak-arc-fill)"
          strokeWidth={PROGRESS_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${ARC_LENGTH}`}
          animatedProps={arcProps}
        />

        {/* Leading-edge ember — white halo + bright coral core, breathing
            slowly so the arc tip feels alive. Hidden when progress === 0
            or === 1 (no tip to show). */}
        {showLead && (
          <>
            <AnimatedCircle
              cx={lead.x}
              cy={lead.y}
              fill="#FFFFFF"
              opacity={0.92}
              animatedProps={dotHaloProps}
            />
            <AnimatedCircle
              cx={lead.x}
              cy={lead.y}
              fill="#FF9F6B"
              animatedProps={dotCoreProps}
            />
          </>
        )}
      </Svg>

      {/* Centred number + optional caption stack. Sits over the SVG via
          absolute fill — pointerEvents none so taps still hit the card. */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.number}>{value}</Text>
        {caption && <Text style={styles.caption}>{caption}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: fonts.bold,
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    color: colors.primaryDeep,
    includeFontPadding: false,
  },
  caption: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginTop: 2,
  },
});
