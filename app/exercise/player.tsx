import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  IconHalo,
  NavHeader,
  PillCTA,
  ProgressDots,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STEPS = [
  { name: 'Chin Tuck',          dur: 45, pose: 'neck-roll' as const },
  { name: 'Upper Trap Stretch', dur: 60, pose: 'neck-roll' as const },
  { name: 'Levator Release',    dur: 30, pose: 'neck-roll' as const },
];

const RING_RADIUS = 140;
const RING_STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function ExercisePlayerScreen() {
  const insets = useSafeAreaInsets();
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = STEPS[stepIdx];

  const progress = useSharedValue(0);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= step.dur) {
          clearInterval(id);
          if (stepIdx < STEPS.length - 1) {
            Haptics.selectionAsync();
            setStepIdx((s) => s + 1);
            return 0;
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => router.replace('/exercise/complete'), 400);
          return step.dur;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, step.dur, stepIdx]);

  useEffect(() => {
    progress.value = withTiming(elapsed / step.dur, {
      duration: 900,
      easing: Easing.linear,
    });
  }, [elapsed, progress, step.dur]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const close = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const prev = () => {
    Haptics.selectionAsync();
    if (stepIdx > 0) {
      setStepIdx((s) => s - 1);
      setElapsed(0);
    }
  };
  const next = () => {
    Haptics.selectionAsync();
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((s) => s + 1);
      setElapsed(0);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/exercise/complete');
    }
  };
  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaused((p) => !p);
  };

  const remaining = step.dur - elapsed;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader onBack={close} rightIcon="close-x" onRightPress={close} />

      <View style={[styles.root, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.topCluster}>
          <Eyebrow>{`STEP ${stepIdx + 1} OF ${STEPS.length}`}</Eyebrow>
          <Text style={styles.stepName}>{step.name}</Text>
          <View style={styles.dotsRow}>
            <ProgressDots count={STEPS.length} active={stepIdx} />
          </View>
        </View>

        <View style={styles.ringCluster}>
          <Svg width={320} height={320} viewBox="0 0 320 320" style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgLinearGradient id="player-ring" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
                <Stop offset="0.5" stopColor={colors.primaryMid} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Circle
              cx={160}
              cy={160}
              r={RING_RADIUS}
              stroke={colors.inkHairline}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={160}
              cy={160}
              r={RING_RADIUS}
              stroke="url(#player-ring)"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={ringProps}
              transform="rotate(-90 160 160)"
            />
          </Svg>
          <View style={styles.ringCenter}>
            <VideoPlaceholder pose={step.pose} width={220} height={220} showPlay={false} />
          </View>
        </View>

        <View style={styles.timerCluster}>
          <Text style={styles.timer}>{`${mm}:${ss}`}</Text>
          <Text style={styles.timerLabel}>remaining</Text>
        </View>

        <View style={styles.transport}>
          <TransportSide icon="skip-back" onPress={prev} disabled={stepIdx === 0} />
          <PillCTA
            variant="iconOnly"
            size="xl"
            icon={paused ? 'play' : 'pause'}
            onPress={togglePause}
            accessibilityLabel={paused ? 'Resume' : 'Pause'}
          />
          <TransportSide icon="check" onPress={next} />
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const TransportSide: React.FC<{ icon: 'skip-back' | 'check'; onPress: () => void; disabled?: boolean }> = ({
  icon,
  onPress,
  disabled,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    hitSlop={8}
    accessibilityRole="button"
    accessibilityLabel={icon === 'skip-back' ? 'Previous step' : 'Next step'}
    style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}
  >
    <IconHalo icon={icon} size="md" tone="coral" variant="glass" glow={false} />
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topCluster: {
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  stepName: {
    ...typeScale.headlineSm,
    color: colors.ink,
    textAlign: 'center',
  },
  dotsRow: {
    marginTop: spacing.sm,
  },
  ringCluster: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCluster: {
    alignItems: 'center',
    gap: 2,
  },
  timer: {
    fontSize: 48,
    lineHeight: 52,
    color: colors.primary,
    letterSpacing: -1,
    fontFamily: typeScale.display.fontFamily,
  },
  timerLabel: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.35,
  },
});
