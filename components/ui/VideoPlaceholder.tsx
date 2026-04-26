import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
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
  Stop,
} from 'react-native-svg';
import { colors, radii } from '../../constants/tokens';

type Pose = 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch';

interface Props {
  pose?: Pose;
  /** Show a subtle play triangle overlay (thumbnail mode). */
  showPlay?: boolean;
  /** Width × height of the placeholder. Default 220×220. */
  width?: number;
  height?: number;
  /** If true, render a compact 80x80 thumbnail layout. */
  compact?: boolean;
}

/**
 * Placeholder for exercise video — real shoots land in Stage 6. Renders a
 * tinted glass panel with a breathing silhouette of the stretch + optional
 * play-triangle overlay. Scales cleanly from 80px thumbs to full-screen hero.
 */
export const VideoPlaceholder: React.FC<Props> = ({
  pose = 'neck-roll',
  showPlay = true,
  width,
  height,
  compact = false,
}) => {
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(1);
  const w = width ?? (compact ? 80 : 220);
  const h = height ?? (compact ? 80 : 220);

  useEffect(() => {
    if (reduceMotion) return;
    breath.value = withRepeat(
      withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, breath]);

  const figureStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  return (
    <View
      style={[
        styles.root,
        {
          width: w,
          height: h,
          borderRadius: compact ? radii.md : radii.xl,
        },
      ]}
    >
      <LinearGradient
        colors={['#FFE4D3', '#FFCEB5', '#FFB599'] as readonly [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.figureWrap, figureStyle]} pointerEvents="none">
        <Figure pose={pose} scale={compact ? 0.46 : 1} />
      </Animated.View>

      {showPlay && (
        <View style={styles.playWrap} pointerEvents="none">
          <View style={[styles.playBtn, compact && styles.playBtnCompact]}>
            <Svg width={compact ? 12 : 18} height={compact ? 12 : 18} viewBox="0 0 18 18">
              <Path d="M4 2 L15 9 L4 16 Z" fill={colors.white} />
            </Svg>
          </View>
        </View>
      )}
    </View>
  );
};

const Figure: React.FC<{ pose: Pose; scale: number }> = ({ pose, scale }) => {
  const VB = 200;
  return (
    <Svg width={VB * scale} height={VB * scale} viewBox={`0 0 ${VB} ${VB}`}>
      <Defs>
        <SvgLinearGradient id="vp-ink" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.primaryDeep} stopOpacity="0.92" />
          <Stop offset="1" stopColor={colors.primary} stopOpacity="0.85" />
        </SvgLinearGradient>
      </Defs>

      {pose === 'neck-roll' && <NeckRoll />}
      {pose === 'back-arch' && <BackArch />}
      {pose === 'eye-rest' && <EyeRest />}
      {pose === 'wrist-stretch' && <WristStretch />}
    </Svg>
  );
};

const ink = { stroke: 'url(#vp-ink)', fill: 'none', strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const NeckRoll = () => (
  <>
    <Circle cx="100" cy="60" r="28" {...ink} />
    <Path d="M100 88 L100 110 Q96 140 92 170" {...ink} />
    <Path d="M100 112 L120 130 M100 112 L80 130" {...ink} />
    <Path d="M70 55 Q100 40 130 55" stroke={colors.primaryMid} strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="4 6" />
    <Circle cx="136" cy="55" r="3.5" fill={colors.primaryMid} />
  </>
);

const BackArch = () => (
  <>
    <Circle cx="80" cy="70" r="22" {...ink} />
    <Path d="M80 92 Q72 120 80 150 L110 170" {...ink} />
    <Path d="M80 120 Q130 110 150 80" stroke={colors.primaryMid} strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" fill="none" />
    <Path d="M80 150 L58 170 M80 150 L66 168" {...ink} />
  </>
);

const EyeRest = () => (
  <>
    <Path d="M40 100 Q100 55 160 100 Q100 145 40 100 Z" {...ink} />
    <Circle cx="100" cy="100" r="22" fill="url(#vp-ink)" />
    <Circle cx="92" cy="93" r="5" fill={colors.white} opacity={0.85} />
    <Path d="M30 100 L20 100 M170 100 L180 100" stroke={colors.primaryDeep} strokeWidth="3" strokeLinecap="round" />
    <Circle cx="14" cy="100" r="3" fill={colors.primaryMid} />
    <Circle cx="186" cy="100" r="3" fill={colors.primaryMid} />
  </>
);

const WristStretch = () => (
  <>
    <Path d="M60 40 L60 110 Q60 130 78 140 L140 140 Q158 138 160 120" {...ink} />
    <Path d="M150 110 Q154 100 160 96" {...ink} />
    <Path d="M135 108 Q138 96 144 92" {...ink} />
    <Path d="M50 120 Q60 132 72 138" stroke={colors.primaryMid} strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" fill="none" />
  </>
);

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  figureWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(157,67,26,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
