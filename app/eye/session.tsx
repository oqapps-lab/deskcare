import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  RadialGradient as SvgRadialGradient,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { BgPattern } from '../../components/ui/BgPattern';
import { DecorativeArc } from '../../components/ui/DecorativeArc';
import { NavHeader } from '../../components/ui/NavHeader';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { ProgressDots } from '../../components/ui/ProgressDots';
import { PillCTA } from '../../components/ui/PillCTA';
import { IconHalo } from '../../components/ui/IconHalo';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DURATION_SEC = 30;
const RING_RADIUS = 122;
const RING_STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Eye Exercise Session. Giant breathing eye in a circular progress ring.
 * Counts UP from 0 to DURATION_SEC. On complete → Pain Check-in.
 */
export default function EyeSessionScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  const eyeScale = useSharedValue(1);
  const progress = useSharedValue(0);

  // Breathing eye scale loop
  useEffect(() => {
    if (reduceMotion) return;
    eyeScale.value = withRepeat(
      withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, eyeScale]);

  // Tick timer
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= DURATION_SEC) {
          clearInterval(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => router.replace('/pain/check-in'), 500);
          return DURATION_SEC;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  // Sync progress to elapsed
  useEffect(() => {
    progress.value = withTiming(elapsed / DURATION_SEC, { duration: 1000, easing: Easing.linear });
  }, [elapsed, progress]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scale: eyeScale.value }] }));
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  const finish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/pain/check-in');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="lavender" />
      <DecorativeArc position="top-right" tone="lavender" size={240} opacity={0.18} />

      <NavHeader title="Eye exercise" onBack={back} />

      <View
        style={[
          styles.root,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.topCluster}>
          <Eyebrow>STEP 1 OF 5</Eyebrow>
          <View style={{ height: spacing.sm }} />
          <Text style={styles.stepTitle}>Distance focus</Text>
          <View style={{ height: spacing.sm }} />
          <View style={styles.dotsCluster}>
            <ProgressDots count={5} active={0} />
          </View>
        </View>

        <View style={styles.ringCluster}>
          {/* Progress ring — SVG */}
          <Svg width={300} height={300} viewBox="0 0 300 300" style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgLinearGradient id="sessionRing" x1="0" y1="0" x2="1" y2="1">
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
              stroke="url(#sessionRing)"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={ringProps}
              transform="rotate(-90 150 150)"
            />
          </Svg>

          {/* Animated breathing eye — softened: warm body, gradient iris with
              less aggressive contrast, single soft highlight (no cartoony pair). */}
          <Animated.View style={[styles.eyeCenter, eyeStyle]}>
            <Svg width={160} height={160} viewBox="0 0 160 160">
              <Defs>
                <SvgLinearGradient id="eyeBody" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.primarySoft} stopOpacity="1" />
                  <Stop offset="1" stopColor={colors.primaryLight} stopOpacity="1" />
                </SvgLinearGradient>
                <SvgRadialGradient id="eyeIris" cx="50%" cy="42%" r="50%">
                  <Stop offset="0" stopColor={colors.primaryMid} stopOpacity="1" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
                </SvgRadialGradient>
              </Defs>
              {/* Eye silhouette — soft warm peach */}
              <Circle cx="80" cy="80" r="58" fill="url(#eyeBody)" />
              {/* Iris — radial gradient for natural depth */}
              <Circle cx="80" cy="80" r="28" fill="url(#eyeIris)" />
              {/* Single subtle highlight at top-left for life */}
              <Circle cx="72" cy="72" r="5" fill={colors.white} opacity={0.55} />
            </Svg>
          </Animated.View>

          {/* Timer overlay */}
          <View style={styles.timerOverlay} pointerEvents="none">
            <Text style={styles.timer}>{`${mm}:${ss}`}</Text>
          </View>
        </View>

        <View style={styles.hintCluster}>
          <Text style={styles.hint}>
            Look at an object{'\n'}20 ft away from you
          </Text>
        </View>

        <View style={styles.transportRow}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setElapsed((e) => Math.max(0, e - 10));
            }}
            accessibilityRole="button"
            accessibilityLabel="Rewind 10 seconds"
            style={({ pressed }) => [pressed && styles.sideBtnPressed]}
          >
            <IconHalo icon="skip-back" size="md" tone="coral" variant="glass" glow={false} />
          </Pressable>
          <PillCTA
            variant="iconOnly"
            size="xl"
            icon={paused ? 'play' : 'pause'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPaused((p) => !p);
            }}
            accessibilityLabel={paused ? 'Resume' : 'Pause'}
          />
          <Pressable
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="Finish exercise"
            style={({ pressed }) => [pressed && styles.sideBtnPressed]}
          >
            <IconHalo icon="check" size="md" tone="coral" variant="glass" glow={false} />
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
  topCluster: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  stepTitle: {
    ...typeScale.headlineSm,
    color: colors.ink,
    textAlign: 'center',
  },
  dotsCluster: {
    marginTop: spacing.sm,
  },
  ringCluster: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerOverlay: {
    position: 'absolute',
    bottom: -spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    ...shadows.soft,
  },
  timer: {
    ...typeScale.titleLg,
    color: colors.ink,
    letterSpacing: 1,
  },
  hintCluster: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  hint: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
    marginTop: spacing.xl,
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  sideBtnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
});
