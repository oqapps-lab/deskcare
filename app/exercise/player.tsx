import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
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
  ExerciseVideo,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useRoutineWithItems } from '../../hooks/useContent';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Video is 3:4 portrait (300×400, matching Russell's shooting spec).
// The progress stroke wraps around the video as a rounded rectangle.
const VIDEO_W = 300;
const VIDEO_H = 400;
const RING_STROKE = 8;
const RING_RADIUS_PX = 24;
// Outer SVG canvas includes a half-stroke + small padding so the stroke
// sits cleanly outside the video, never bleeding into the rounded corners.
const SVG_PAD = 12;
const SVG_W = VIDEO_W + 2 * SVG_PAD;
const SVG_H = VIDEO_H + 2 * SVG_PAD;
// Perimeter of a rounded rectangle = 2(W + H − 2r) − 8r + 2πr.
const RING_PERIMETER =
  2 * (VIDEO_W + VIDEO_H - 2 * RING_RADIUS_PX) +
  2 * Math.PI * RING_RADIUS_PX;

const poseFor = (code: string | undefined): 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch' => {
  if (!code) return 'neck-roll';
  if (code.startsWith('N')) return 'neck-roll';
  if (code.startsWith('B') || code.startsWith('S') || code.startsWith('F')) return 'back-arch';
  if (code.startsWith('W')) return 'wrist-stretch';
  if (code.startsWith('E')) return 'eye-rest';
  return 'neck-roll';
};

export default function ExercisePlayerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ routine?: string }>();
  const routineSlug = (params.routine as string) || 'neck-quick-2min';
  const { items, loading } = useRoutineWithItems(routineSlug);

  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  const step = items[stepIdx];
  // Per Russell's atom×reps spec: real item duration = atom.duration_seconds × reps.
  const stepDur = step ? (step.exercise?.duration_seconds ?? 5) * step.reps : 1;

  const progress = useSharedValue(0);

  // Tick when items loaded + not paused.
  useEffect(() => {
    if (!step || paused) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= stepDur) {
          clearInterval(id);
          if (stepIdx < items.length - 1) {
            Haptics.selectionAsync();
            setStepIdx((s) => s + 1);
            return 0;
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => router.replace('/exercise/complete'), 400);
          return stepDur;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, stepDur, stepIdx, items.length, step]);

  useEffect(() => {
    if (!step) {
      progress.value = 0;
      return;
    }
    progress.value = withTiming(elapsed / stepDur, {
      duration: 900,
      easing: Easing.linear,
    });
  }, [elapsed, progress, stepDur, step]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_PERIMETER * (1 - progress.value),
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
    if (stepIdx < items.length - 1) {
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

  const remaining = Math.max(0, stepDur - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  if (loading || !step) {
    return (
      <AtmosphericBackground>
        <NavHeader onBack={close} rightIcon="close-x" onRightPress={close} />
        <View style={[styles.root, { paddingBottom: insets.bottom + spacing.xl, justifyContent: 'center' }]}>
          <ActivityIndicator color={colors.primaryMid} />
        </View>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader onBack={close} rightIcon="close-x" onRightPress={close} />

      <View style={[styles.root, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.topCluster}>
          <Eyebrow>{`STEP ${stepIdx + 1} OF ${items.length}`}</Eyebrow>
          <Text style={styles.stepName}>{step.exercise?.title ?? step.exercise?.code ?? '—'}</Text>
          <Text style={styles.stepMeta}>
            {step.exercise?.code} · {step.exercise?.duration_seconds}s × {step.reps}
          </Text>
          <View style={styles.dotsRow}>
            <ProgressDots count={Math.min(items.length, 7)} active={Math.min(stepIdx, 6)} />
          </View>
        </View>

        <View style={styles.ringCluster}>
          <ExerciseVideo
            pose={poseFor(step.exercise?.code)}
            videoUrl={step.exercise?.video_url}
            width={VIDEO_W}
            height={VIDEO_H}
            radius="xl"
            showPlay={false}
          />
          <Svg
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={styles.ringSvg}
            pointerEvents="none"
          >
            <Defs>
              <SvgLinearGradient id="player-ring" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
                <Stop offset="0.5" stopColor={colors.primaryMid} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Rect
              x={SVG_PAD}
              y={SVG_PAD}
              width={VIDEO_W}
              height={VIDEO_H}
              rx={RING_RADIUS_PX}
              ry={RING_RADIUS_PX}
              stroke={colors.inkHairline}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <AnimatedRect
              x={SVG_PAD}
              y={SVG_PAD}
              width={VIDEO_W}
              height={VIDEO_H}
              rx={RING_RADIUS_PX}
              ry={RING_RADIUS_PX}
              stroke="url(#player-ring)"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RING_PERIMETER}
              animatedProps={ringProps}
            />
          </Svg>
        </View>

        {step.overlay_text && (
          <Text style={styles.overlayText}>{step.overlay_text}</Text>
        )}

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
  stepMeta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  overlayText: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dotsRow: {
    marginTop: spacing.sm,
  },
  ringCluster: {
    width: SVG_W,
    height: SVG_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
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
