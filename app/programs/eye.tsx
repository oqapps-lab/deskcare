import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedProps,
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
  Stop,
  Path,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  NavHeader,
  PillCTA,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useExercises } from '../../hooks/useContent';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DURATION_SEC = 20;
const RING_RADIUS = 100;
const RING_STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} SEC`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} MIN` : `${m}:${s.toString().padStart(2, '0')} MIN`;
};

export default function EyeProgramScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const { exercises, loading: exLoading } = useExercises('eyes');

  const progress = useSharedValue(0);
  const ringPulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    ringPulse.value = withRepeat(
      withTiming(1.04, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, ringPulse]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= DURATION_SEC) {
          clearInterval(id);
          return DURATION_SEC;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    progress.value = withTiming(elapsed / DURATION_SEC, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [elapsed, progress]);

  const restart = () => {
    Haptics.selectionAsync();
    setElapsed(0);
    setRunning(true);
    progress.value = 0;
  };
  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const openExercise = (id: string) => {
    Haptics.selectionAsync();
    router.push({ pathname: `/library/${id}` as never, params: {} } as never);
  };
  const startRoutine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/exercise/preview' as never,
      params: { routine: 'eye-full-3min' },
    } as never);
  };

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringPulse.value }] }));
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="lavender" />
      <DecorativeArc position="top-right" tone="lavender" size={220} opacity={0.20} />

      <NavHeader title="Eye Program" onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timerWrap}>
          <Animated.View style={[styles.ringWrap, ringStyle]}>
            <Svg width={240} height={240} viewBox="0 0 240 240">
              <Defs>
                <SvgLinearGradient id="eye-ring" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.tertiaryMid} stopOpacity="0.9" />
                  <Stop offset="1" stopColor={colors.tertiary} stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx={120}
                cy={120}
                r={RING_RADIUS}
                stroke={colors.inkHairline}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <AnimatedCircle
                cx={120}
                cy={120}
                r={RING_RADIUS}
                stroke="url(#eye-ring)"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={ringProps}
                transform="rotate(-90 120 120)"
              />
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={styles.countNumber}>{DURATION_SEC - elapsed}</Text>
              <Eyebrow variant="accent">SECONDS</Eyebrow>
            </View>
          </Animated.View>
          <Text style={styles.caption}>Look 20 feet away</Text>
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>
        </View>

        <Pressable onPress={restart} hitSlop={8} accessibilityRole="button" accessibilityLabel="Restart timer">
          <View style={styles.restartRow}>
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Path d="M4 4 Q7 1 10 4 L11 5 M11 2 L11 5 L8 5 M10 10 Q7 13 4 10 L3 9 M3 12 L3 9 L6 9" stroke={colors.primaryMid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
            <Text style={styles.restartText}>Restart timer</Text>
          </View>
        </Pressable>

        <View style={styles.ruleWrap}>
          <GlassCard tint="lavender" radius="xl" padding={spacing.xl} innerGradient>
            <Eyebrow>THE 20-20-20 RULE</Eyebrow>
            <Text style={styles.ruleTitle}>Every 20 min · 20 seconds · 20 feet away.</Text>
            <Text style={styles.ruleBody}>
              Your near-focus muscles lock when you stare at a monitor. A
              20-second far-focus lets them fully release.
            </Text>
          </GlassCard>
        </View>

        <View style={styles.routineCtaWrap}>
          <PillCTA variant="primary" size="lg" icon="play" iconBg onPress={startRoutine}>
            Start 3-min eye routine
          </PillCTA>
        </View>

        <Eyebrow>
          {exercises ? `BROWSE ${exercises.length} EXERCISES` : 'BROWSE EXERCISES'}
        </Eyebrow>
        <View style={styles.list}>
          {exLoading && !exercises ? (
            <View style={styles.exerciseWrap}>
              <GlassCard tint="cream" radius="xl" padding={spacing.md}>
                <Text style={styles.exerciseMeta}>Loading…</Text>
              </GlassCard>
            </View>
          ) : (
            (exercises ?? []).map((e) => (
              <Pressable
                key={e.id}
                onPress={() => openExercise(e.slug)}
                accessibilityRole="button"
                accessibilityLabel={`${e.title_en ?? e.title} · ${formatDuration(e.duration_seconds)}`}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <View style={styles.exerciseWrap}>
                  <GlassCard tint="cream" radius="xl" padding={spacing.md}>
                    <View style={styles.exerciseRow}>
                      <VideoPlaceholder pose="eye-rest" compact />
                      <View style={styles.exerciseText}>
                        <Text style={styles.exerciseName}>{e.title_en ?? e.title}</Text>
                        <Text style={styles.exerciseMeta}>
                          {formatDuration(e.duration_seconds)} · EYES
                        </Text>
                      </View>
                      <Svg width={14} height={14} viewBox="0 0 14 14">
                        <Path
                          d="M5 3 L9 7 L5 11"
                          stroke={colors.inkSubtle}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </Svg>
                    </View>
                  </GlassCard>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  timerWrap: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  ringWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNumber: {
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -1.4,
    color: colors.tertiary,
    fontFamily: typeScale.display.fontFamily,
  },
  caption: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryDim,
  },
  dotActive: {
    backgroundColor: colors.tertiaryMid,
    width: 22,
    borderRadius: 999,
  },
  restartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  restartText: {
    ...typeScale.bodySm,
    color: colors.primaryMid,
  },
  ruleWrap: {
    marginBottom: spacing.xl,
  },
  routineCtaWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ruleTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  ruleBody: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  exerciseWrap: {},
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  exerciseText: {
    flex: 1,
    minWidth: 0,
  },
  exerciseName: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  exerciseMeta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
