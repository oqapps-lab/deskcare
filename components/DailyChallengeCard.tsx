import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { colors, spacing, typeScale } from '../constants/tokens';
import { GlassCard } from './ui';
import type { DailyChallenge } from '../hooks/useDailyChallenge';

/**
 * Daily challenge card — target: 2 routines per day.
 * Shows progress bar + label; when complete, swaps to a "completed" state
 * with a soft pulsing halo and confident copy.
 */
export const DailyChallengeCard: React.FC<{ challenge: DailyChallenge }> = ({ challenge }) => {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const halo = useSharedValue(0.92);

  useEffect(() => {
    progress.value = withTiming(challenge.progress, {
      duration: reduceMotion ? 200 : 700,
      easing: Easing.out(Easing.cubic),
    });
    if (challenge.done && !reduceMotion) {
      halo.value = withRepeat(
        withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
  }, [challenge.progress, challenge.done, reduceMotion, progress, halo]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: halo.value }],
    opacity: challenge.done ? 1 : 0,
  }));

  const title = challenge.done ? 'Daily challenge complete' : "Today's challenge";
  const sub = challenge.done
    ? 'Two routines done — you protected your body today.'
    : `${challenge.completed} of ${challenge.target} routines done`;

  return (
    <View style={styles.wrap}>
      <GlassCard tint={challenge.done ? 'mint' : 'cream'} radius="xl" padding={spacing.lg} innerGradient>
        {challenge.done && (
          <Animated.View style={[styles.haloWrap, haloStyle]} pointerEvents="none">
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Defs>
                <SvgRadialGradient id="dc-halo" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.mintMid} stopOpacity="0.55" />
                  <Stop offset="1" stopColor={colors.mintMid} stopOpacity="0" />
                </SvgRadialGradient>
              </Defs>
              <Circle cx="60" cy="60" r="55" fill="url(#dc-halo)" />
            </Svg>
          </Animated.View>
        )}
        <Text style={styles.eyebrow}>{challenge.done ? 'COMPLETE' : 'DAILY GOAL'}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, fillStyle, challenge.done && styles.barFillDone]} />
        </View>

        <View style={styles.tickRow}>
          {Array.from({ length: challenge.target }).map((_, i) => {
            const filled = i < challenge.completed;
            return (
              <View
                key={i}
                style={[
                  styles.tickDot,
                  filled && styles.tickDotFilled,
                  challenge.done && filled && styles.tickDotDone,
                ]}
              />
            );
          })}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
  },
  haloWrap: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginBottom: spacing.xs,
  },
  title: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  sub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginBottom: spacing.md,
  },
  barTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceMid,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primaryMid,
    borderRadius: 4,
  },
  barFillDone: {
    backgroundColor: colors.mintMid,
  },
  tickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tickDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceMid,
  },
  tickDotFilled: {
    backgroundColor: colors.primaryMid,
  },
  tickDotDone: {
    backgroundColor: colors.mintMid,
  },
});
