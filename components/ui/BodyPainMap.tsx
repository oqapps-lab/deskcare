import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '../../constants/tokens';

export type PainZone =
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'chest'
  | 'abdomen'
  | 'lowerBack';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  painZones?: PainZone[];
  width?: number;
  height?: number;
}

// Coordinates inside the 240x320 viewBox for each zone
const zoneCoords: Record<PainZone, { cx: number; cy: number; r: number }> = {
  neck: { cx: 120, cy: 82, r: 18 },
  leftShoulder: { cx: 68, cy: 120, r: 24 },
  rightShoulder: { cx: 172, cy: 120, r: 24 },
  chest: { cx: 120, cy: 160, r: 28 },
  abdomen: { cx: 120, cy: 215, r: 26 },
  lowerBack: { cx: 120, cy: 250, r: 22 },
};

/**
 * Stylized torso silhouette (anterior view) with pulsing coral dots on
 * selected pain zones. Replaces the photo-JPG body map in the Stitch design
 * with a performant, scalable SVG.
 */
export const BodyPainMap: React.FC<Props> = ({
  painZones = [],
  width = 240,
  height = 320,
}) => {
  return (
    <View style={[styles.root, { width, height }]}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 240 320"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Light warm peach background — matches the cream-coral mood of
              the rest of the app instead of fighting it with a dark editorial
              panel. */}
          <SvgLinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primarySoft} stopOpacity="0.7" />
            <Stop offset="1" stopColor={colors.primaryLight} stopOpacity="0.55" />
          </SvgLinearGradient>
          <SvgRadialGradient id="painDot" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="55%" stopColor={colors.primaryMid} stopOpacity="0.55" />
            <Stop offset="100%" stopColor={colors.primaryMid} stopOpacity="0" />
          </SvgRadialGradient>
        </Defs>
        {/* Soft warm pane — same family as the surrounding cards. Pain dots
            sit on top with a slightly bolder coral so they still pop. */}
        <Rect x="0" y="0" width="240" height="320" rx="28" fill="url(#bg)" />

        {/* head */}
        <Circle
          cx="120"
          cy="50"
          r="28"
          fill="none"
          stroke="rgba(123,52,28,0.28)"
          strokeWidth="1.5"
        />
        {/* neck */}
        <Path
          d="M108 78 Q108 90 115 96 H125 Q132 90 132 78"
          fill="none"
          stroke="rgba(123,52,28,0.28)"
          strokeWidth="1.5"
        />
        {/* torso outline */}
        <Path
          d="M65 105 Q72 96 92 94 Q108 94 120 96 Q132 94 148 94 Q168 96 175 105
             L190 155 Q192 200 186 245 Q178 280 165 290 L120 300 L75 290
             Q62 280 54 245 Q48 200 50 155 Z"
          fill="none"
          stroke="rgba(123,52,28,0.32)"
          strokeWidth="1.5"
        />
        {/* chest reference line */}
        <Path
          d="M92 140 Q120 155 148 140"
          fill="none"
          stroke="rgba(123,52,28,0.16)"
          strokeWidth="1"
        />
        {/* abdominal midline */}
        <Path
          d="M120 140 L120 260"
          fill="none"
          stroke="rgba(123,52,28,0.14)"
          strokeWidth="1"
        />

        {/* pain dots */}
        {painZones.map((z) => {
          const c = zoneCoords[z];
          return <PainDot key={z} cx={c.cx} cy={c.cy} baseR={c.r} />;
        })}
      </Svg>
    </View>
  );
};

const PainDot: React.FC<{ cx: number; cy: number; baseR: number }> = ({
  cx,
  cy,
  baseR,
}) => {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [t]);

  const outerProps = useAnimatedProps(() => ({
    r: baseR * (1 + t.value * 0.18),
    opacity: 0.35 + (1 - t.value) * 0.35,
  }));
  const coreProps = useAnimatedProps(() => ({
    r: baseR * 0.45 * (1 + t.value * 0.08),
    opacity: 0.85,
  }));

  return (
    <>
      {/* Static `r` prop prevents invisible first frame before reanimated kicks in */}
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={baseR}
        animatedProps={outerProps}
        fill="url(#painDot)"
      />
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={baseR * 0.45}
        animatedProps={coreProps}
        fill={colors.primaryMid}
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
