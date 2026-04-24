import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  IconHalo,
  NavHeader,
  PillCTA,
  ProgressBar,
  SizeCircleRow,
  type SizeCircleOption,
} from '../../../components/ui';
import type { GlyphName } from '../../../components/ui';
import type { HaloTone } from '../../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../../constants/tokens';

type Goal = 'stop' | 'prevent' | 'energy';

const GOALS: ReadonlyArray<{ id: Goal; title: string; icon: GlyphName; tone: HaloTone }> = [
  { id: 'stop',    title: 'Make the pain stop',         icon: 'check',   tone: 'coral' },
  { id: 'prevent', title: 'Prevent it coming back',     icon: 'refresh', tone: 'peach' },
  { id: 'energy',  title: 'More energy through the day', icon: 'eye',     tone: 'lavender' },
];

const HOUR_OPTIONS: readonly SizeCircleOption[] = [
  { value: '4–6', label: 'Hours' },
  { value: '6–8', label: 'Hours' },
  { value: '8+',  label: 'Hours' },
];

export default function QuizGoalScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [hours, setHours] = useState<string | null>(null);

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
  const ready = () => {
    if (!goal || !hours) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding/labor-illusion');
  };

  const canAdvance = !!goal && !!hours;

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={220} opacity={0.20} />
      <DecorativeArc position="bottom-left" tone="mint" size={200} opacity={0.16} />

      <NavHeader onBack={back} />

      <Animated.View style={[styles.wrap, contentStyle]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + 180,
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressBlock}>
            <Eyebrow>STEP 4 OF 4</Eyebrow>
            <View style={{ height: spacing.sm }} />
            <ProgressBar value={1.0} accessibilityLabel="Quiz progress: step 4 of 4" />
          </View>

          <Text style={styles.title}>What are you{'\n'}hoping for?</Text>

          <View style={styles.goals}>
            {GOALS.map((g) => {
              const active = goal === g.id;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setGoal(g.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={g.title}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={active ? styles.rowActive : undefined}>
                    <GlassCard
                      tint={active ? 'peach' : 'cream'}
                      radius="xl"
                      padding={spacing.lg}
                      innerGradient={active}
                    >
                      <View style={styles.goalRow}>
                        <IconHalo
                          icon={g.icon}
                          size="md"
                          tone={g.tone}
                          variant={active ? 'gradient' : 'tinted'}
                          glow={active}
                        />
                        <Text style={[styles.goalTitle, active && styles.goalTitleActive]}>
                          {g.title}
                        </Text>
                        {active && <View style={styles.dot} />}
                      </View>
                    </GlassCard>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.hoursBlock}>
            <Eyebrow>AND HOW MANY HOURS AT YOUR DESK?</Eyebrow>
            <View style={{ height: spacing.lg }} />
            <SizeCircleRow options={HOUR_OPTIONS} value={hours} onChange={setHours} />
          </View>
        </ScrollView>
      </Animated.View>

      <Animated.View
        style={[styles.ctaFloating, ctaStyle, { paddingBottom: insets.bottom + spacing.md }]}
        pointerEvents="box-none"
      >
        <PillCTA
          variant="primary"
          size="lg"
          onPress={ready}
          disabled={!canAdvance}
          breath={canAdvance}
          accessibilityLabel={canAdvance ? 'Ready — continue to plan' : 'Pick a goal and hours'}
        >
          Ready
        </PillCTA>
      </Animated.View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  progressBlock: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  goals: {
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
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalTitle: {
    ...typeScale.title,
    color: colors.inkMuted,
    flex: 1,
    minWidth: 0,
  },
  goalTitleActive: {
    color: colors.ink,
    fontFamily: typeScale.titleLg.fontFamily,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryMid,
  },
  hoursBlock: {
    marginTop: spacing.xxxl,
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
