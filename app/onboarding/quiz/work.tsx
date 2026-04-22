import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  NavHeader,
  PillCTA,
  ProgressBar,
} from '../../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../../constants/tokens';

type Work = 'home' | 'office' | 'hybrid';

const OPTIONS: ReadonlyArray<{ id: Work; label: string; svg: React.ReactNode }> = [
  { id: 'home',   label: 'Home office', svg: <HomeSvg /> },
  { id: 'office', label: 'In office',   svg: <OfficeSvg /> },
  { id: 'hybrid', label: 'Hybrid',      svg: <HybridSvg /> },
];

export default function QuizWorkScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [choice, setChoice] = useState<Work | null>(null);

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 440 });
    contentY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    ctaOpacity.value = withDelay(reduceMotion ? 0 : 320, withTiming(1, { duration: 420 }));
  }, [reduceMotion, contentOpacity, contentY, ctaOpacity]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const next = () => {
    if (!choice) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/quiz/goal');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="peach" />
      <DecorativeArc position="top-left" tone="peach" size={240} opacity={0.20} />

      <NavHeader onBack={back} />

      <Animated.View style={[styles.root, contentStyle, { paddingBottom: insets.bottom + 160 }]}>
        <View style={styles.progressBlock}>
          <Eyebrow>STEP 3 OF 5</Eyebrow>
          <View style={{ height: spacing.sm }} />
          <ProgressBar value={0.6} accessibilityLabel="Quiz progress: step 3 of 5" />
        </View>

        <View style={styles.statPool}>
          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <Text style={styles.statNumber}>87%</Text>
            <Text style={styles.statCopy}>
              of desk workers with neck pain{'\n'}
              report relief within 14 days.
            </Text>
          </GlassCard>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>Where do you work?</Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((o) => {
            const active = choice === o.id;
            return (
              <Pressable
                key={o.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setChoice(o.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={o.label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <View style={active ? styles.rowActive : undefined}>
                  <GlassCard
                    tint={active ? 'coral' : 'cream'}
                    radius="xl"
                    padding={spacing.lg}
                    innerGradient={active}
                  >
                    <View style={styles.row}>
                      <View style={styles.iconSlot}>{o.svg}</View>
                      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                        {o.label}
                      </Text>
                      {active && <View style={styles.dot} />}
                    </View>
                  </GlassCard>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.ctaFloating, ctaStyle, { paddingBottom: insets.bottom + spacing.md }]}
        pointerEvents="box-none"
      >
        <PillCTA
          variant="primary"
          size="lg"
          onPress={next}
          accessibilityLabel={choice ? 'Next step' : 'Pick a work type'}
        >
          Next
        </PillCTA>
      </Animated.View>
    </AtmosphericBackground>
  );
}

function HomeSvg() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M4 11 L12 4 L20 11 L20 20 L14 20 L14 14 L10 14 L10 20 L4 20 Z" stroke={colors.primaryMid} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
function OfficeSvg() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M5 20 L5 5 L19 5 L19 20 Z" stroke={colors.primaryMid} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <Path d="M8 8 L10 8 M13 8 L16 8 M8 12 L10 12 M13 12 L16 12 M8 16 L10 16 M13 16 L16 16" stroke={colors.primaryMid} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}
function HybridSvg() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M4 11 L8 7 L12 11 L12 18 L4 18 Z" stroke={colors.primaryMid} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      <Path d="M14 18 L14 9 L20 9 L20 18 Z" stroke={colors.primaryMid} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      <Path d="M12 14 L14 14" stroke={colors.primaryMid} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  progressBlock: {
    marginBottom: spacing.xl,
  },
  statPool: {
    marginBottom: spacing.xl,
  },
  statNumber: {
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.1,
    fontFamily: typeScale.display.fontFamily,
    color: colors.primary,
  },
  statCopy: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  copy: {
    marginBottom: spacing.md,
  },
  title: {
    ...typeScale.headlineSm,
    color: colors.ink,
  },
  options: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  rowActive: {
    ...shadows.chip,
    borderRadius: 36,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    ...typeScale.title,
    color: colors.inkMuted,
    flex: 1,
    minWidth: 0,
  },
  optionLabelActive: {
    color: colors.ink,
    fontFamily: typeScale.titleLg.fontFamily,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryMid,
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
});
