import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  Eyebrow,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DURATION_MS = 5600;
const RING_RADIUS = 130;
const RING_STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const STAGES = [
  'Reading your answers',
  'Matching exercises to your shoulders',
  'Laying out your first 14 days',
];

/**
 * Labor Illusion — a calm perceived-wait. Ring fills 0→1 over ~5.6s while
 * three whisper lines rotate through the stages. Small "complete" haptic at 100%,
 * then auto-advance to /onboarding/plan.
 */
export default function LaborIllusionScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const progress = useSharedValue(0);
  const percent = useSharedValue(0);
  const [percentText, setPercentText] = useState('0%');
  const [stage, setStage] = useState(0);
  const stageOpacity = useSharedValue(1);
  const stageY = useSharedValue(0);

  useEffect(() => {
    const dur = reduceMotion ? 1600 : DURATION_MS;
    progress.value = withTiming(1, { duration: dur, easing: Easing.inOut(Easing.cubic) });
    percent.value = withTiming(100, { duration: dur, easing: Easing.inOut(Easing.cubic) });

    const id = setInterval(() => {
      setPercentText(`${Math.round(percent.value)}%`);
    }, 80);

    const stageTimes = [
      Math.round(dur * 0.05),
      Math.round(dur * 0.40),
      Math.round(dur * 0.75),
    ];
    const t1 = setTimeout(() => crossfadeStage(0), stageTimes[0]);
    const t2 = setTimeout(() => crossfadeStage(1), stageTimes[1]);
    const t3 = setTimeout(() => crossfadeStage(2), stageTimes[2]);

    const done = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/onboarding/plan');
    }, dur + 400);

    return () => {
      clearInterval(id);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  const crossfadeStage = (i: number) => {
    stageOpacity.value = withTiming(0, { duration: 220 }, () => {
      runOnJS(setStage)(i);
      stageOpacity.value = withTiming(1, { duration: 280 });
      stageY.value = withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) });
    });
    stageY.value = 8;
  };

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const stageStyle = useAnimatedStyle(() => ({
    opacity: stageOpacity.value,
    transform: [{ translateY: stageY.value }],
  }));

  return (
    <AtmosphericBackground>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
      >
        <View style={styles.eyebrowWrap}>
          <Eyebrow variant="accent">BUILDING YOUR PROGRAM</Eyebrow>
        </View>

        <View style={styles.ringWrap}>
          {/* Outer aura */}
          <View style={styles.auraLayer} pointerEvents="none">
            <Svg width={320} height={320} viewBox="0 0 320 320">
              <Defs>
                <SvgRadialGradient id="li-aura" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.45" />
                  <Stop offset="0.6" stopColor={colors.primaryMid} stopOpacity="0.12" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </SvgRadialGradient>
              </Defs>
              <Circle cx="160" cy="160" r="150" fill="url(#li-aura)" />
            </Svg>
          </View>

          {/* Progress ring */}
          <Svg width={300} height={300} viewBox="0 0 300 300">
            <Defs>
              <SvgLinearGradient id="li-ring" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
                <Stop offset="0.5" stopColor={colors.primaryMid} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            {/* Track */}
            <Circle
              cx={150}
              cy={150}
              r={RING_RADIUS}
              stroke={colors.inkHairline}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            {/* Progress */}
            <AnimatedCircle
              cx={150}
              cy={150}
              r={RING_RADIUS}
              stroke="url(#li-ring)"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={ringProps}
              transform="rotate(-90 150 150)"
            />
          </Svg>

          {/* Percent number, centered */}
          <View style={styles.percentOverlay} pointerEvents="none">
            <Text style={styles.percent}>{percentText}</Text>
            <Text style={styles.percentSub}>COMPLETE</Text>
          </View>
        </View>

        <View style={styles.stageWrap}>
          <Animated.Text style={[styles.stage, stageStyle]}>{STAGES[stage]}</Animated.Text>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
  },
  eyebrowWrap: {
    alignItems: 'center',
  },
  ringWrap: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraLayer: {
    position: 'absolute',
    width: 320,
    height: 320,
  },
  percentOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 72,
    lineHeight: 76,
    fontFamily: typeScale.display.fontFamily,
    color: colors.primary,
    letterSpacing: -1.6,
  },
  percentSub: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  stageWrap: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    ...typeScale.titleLg,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
