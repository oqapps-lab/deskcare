import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  Eyebrow,
  GlassCard,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';

/**
 * On signed-in completion: atomically insert a sessions row and bump the
 * streak via the `log_completed_session` SECURITY DEFINER RPC. Single round-
 * trip — replaces the previous client-side read-modify-write that raced when
 * the same user finished two sessions concurrently across devices.
 *
 * Best-effort: RLS / network / anon all silently no-op so the celebration
 * still renders.
 */
const logCompletedSession = async (
  durationSeconds: number,
  movesTotal: number,
) => {
  await supabase.rpc('log_completed_session', {
    p_session_type: 'routine',
    p_duration_sec: durationSeconds,
    p_exercises_total: movesTotal,
    p_exercises_completed: movesTotal,
    p_exercises_skipped: 0,
  });
};

const STATS = [
  { value: '2:15', label: 'TIME' },
  { value: '3',    label: 'MOVES' },
  { value: '7',    label: 'DAY STREAK' },
];

export default function SessionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const userId = useUserId();
  const writtenRef = React.useRef(false);

  useEffect(() => {
    if (!userId || writtenRef.current) return;
    writtenRef.current = true;
    // Demo metadata: 2:15 = 135s, 3 moves. Stage 7 will compute from actual session.
    logCompletedSession(135, 3).catch(() => {
      // Best-effort; silent on RLS / network.
    });
  }, [userId]);

  const burst = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);
  const check = useSharedValue(0);

  useEffect(() => {
    const d = reduceMotion ? 200 : 480;
    burst.value = withTiming(1, { duration: d + 100, easing: Easing.out(Easing.cubic) });
    contentOpacity.value = withDelay(reduceMotion ? 0 : 280, withTiming(1, { duration: 520 }));
    contentY.value = withDelay(reduceMotion ? 0 : 280, withTiming(0, { duration: 560, easing: Easing.out(Easing.cubic) }));
    check.value = withDelay(reduceMotion ? 0 : 140, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));

    if (!reduceMotion) {
      const pulse = withRepeat(
        withTiming(1.03, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
      burst.value = pulse;
    }
  }, [reduceMotion, burst, contentOpacity, contentY, check]);

  const burstStyle = useAnimatedStyle(() => ({ transform: [{ scale: burst.value }] }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: check.value }],
    opacity: check.value,
  }));

  const done = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/main/home');
  };
  const rate = () => {
    Haptics.selectionAsync();
    router.push('/pain/check-in');
  };

  return (
    <AtmosphericBackground>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.xxxl,
          },
        ]}
      >
        <View style={styles.heroWrap}>
          <Animated.View style={[styles.burstWrap, burstStyle]} pointerEvents="none">
            <Svg width={280} height={280} viewBox="0 0 280 280">
              <Defs>
                <SvgRadialGradient id="sc-burst" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.75" />
                  <Stop offset="0.6" stopColor={colors.primaryMid} stopOpacity="0.22" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </SvgRadialGradient>
              </Defs>
              <Circle cx="140" cy="140" r="130" fill="url(#sc-burst)" />
            </Svg>
          </Animated.View>

          {/* Modern "success" mark: no flat coral disk. Warm radial glow drifts
              behind a bold gradient tick — feels like a soft "yes" exhaled,
              not a kindergarten badge stamp. */}
          <Animated.View style={[styles.checkWrap, checkStyle]}>
            <Svg width={160} height={160} viewBox="0 0 160 160">
              <Defs>
                <SvgRadialGradient id="sc-check-glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.95" />
                  <Stop offset="0.45" stopColor={colors.primaryMid} stopOpacity="0.45" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </SvgRadialGradient>
                <SvgLinearGradient id="sc-tick" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={colors.primaryDeep} stopOpacity="1" />
                  <Stop offset="0.55" stopColor={colors.primary} stopOpacity="1" />
                  <Stop offset="1" stopColor={colors.primaryMid} stopOpacity="1" />
                </SvgLinearGradient>
                {/* Subtle highlight along the top of the tick — gives it dimension. */}
                <SvgLinearGradient id="sc-tick-shine" x1="0.5" y1="0" x2="0.5" y2="1">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              {/* Soft warm halo behind the tick — no hard circle. */}
              <Circle cx="80" cy="80" r="72" fill="url(#sc-check-glow)" />
              {/* Tick — drawn twice: thicker gradient stroke for the body, thin
                  white-alpha stroke for the inner highlight. */}
              <Path
                d="M48 84 L70 104 L114 56"
                stroke="url(#sc-tick)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M48 84 L70 104 L114 56"
                stroke="url(#sc-tick-shine)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Animated.View>
        </View>

        <Animated.View style={contentStyle}>
          <Eyebrow variant="accent">WELL DONE</Eyebrow>
          <Text style={styles.title}>That's two minutes{'\n'}your neck didn't hold.</Text>
          <Text style={styles.sub}>
            Three small releases. Your shoulders should feel{'\n'}a little softer already.
          </Text>

          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient>
            <View style={styles.statsRow}>
              {STATS.map((s, i) => (
                <React.Fragment key={s.label}>
                  <View style={styles.statCol}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                  {i < STATS.length - 1 && <View style={styles.statDivider} />}
                </React.Fragment>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" breath onPress={done}>
            Back to home
          </PillCTA>
          <Pressable
            onPress={rate}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Rate your neck"
            style={{ marginTop: spacing.md }}
          >
            <Text style={styles.rateLink}>Rate how your neck feels</Text>
          </Pressable>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroWrap: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstWrap: {
    position: 'absolute',
  },
  checkWrap: {},
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 40,
    lineHeight: 44,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
    letterSpacing: -0.8,
  },
  statLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.inkHairline,
  },
  ctaBlock: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  rateLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
