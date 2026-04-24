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
} from '../../../components/ui';
import type { GlyphName } from '../../../components/ui';
import type { HaloTone } from '../../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../../constants/tokens';

type Frequency = 'sometimes' | 'weekly' | 'daily';

const OPTIONS: ReadonlyArray<{
  id: Frequency;
  title: string;
  sub: string;
  icon: GlyphName;
  tone: HaloTone;
}> = [
  { id: 'sometimes', title: 'Sometimes',            sub: 'A few times a month', icon: 'clock',    tone: 'lavender' },
  { id: 'weekly',    title: 'A few times a week',    sub: 'Background tension',  icon: 'refresh',  tone: 'peach' },
  { id: 'daily',     title: 'Every single day',      sub: 'Can\'t ignore it',    icon: 'eye',      tone: 'coral' },
];

export default function QuizFrequencyScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [choice, setChoice] = useState<Frequency | null>(null);

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
    router.push('/onboarding/quiz/work');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="bottom-right" tone="lavender" size={220} opacity={0.18} />

      <NavHeader onBack={back} />

      <Animated.View style={[styles.root, contentStyle, { paddingBottom: insets.bottom + 160 }]}>
        <View style={styles.progressBlock}>
          <Eyebrow>STEP 2 OF 4</Eyebrow>
          <View style={{ height: spacing.sm }} />
          <ProgressBar value={0.5} accessibilityLabel="Quiz progress: step 2 of 4" />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>How often does it{'\n'}bother you?</Text>
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
                accessibilityLabel={`${o.title}. ${o.sub}`}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <View style={active ? styles.optionCardActive : styles.optionCardInactive}>
                  <GlassCard
                    tint={active ? 'peach' : 'cream'}
                    radius="xl"
                    padding={spacing.lg}
                    innerGradient={active}
                    decorativeCorner={active}
                  >
                    <View style={styles.optionRow}>
                      <IconHalo
                        icon={o.icon}
                        size="md"
                        tone={o.tone}
                        variant={active ? 'gradient' : 'tinted'}
                        glow={active}
                      />
                      <View style={styles.optionText}>
                        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                          {o.title}
                        </Text>
                        <Text style={styles.optionSub}>{o.sub}</Text>
                      </View>
                      {active && <ActiveDot />}
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
          disabled={!choice}
          breath={!!choice}
          accessibilityLabel={choice ? 'Next step' : 'Pick an option'}
        >
          Next
        </PillCTA>
      </Animated.View>
    </AtmosphericBackground>
  );
}

const ActiveDot = () => <View style={styles.dot} />;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  progressBlock: {
    marginBottom: spacing.xl,
  },
  copy: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  options: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  optionCardInactive: {},
  optionCardActive: {
    ...shadows.chip,
    borderRadius: 36,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  optionTitleActive: {
    fontFamily: typeScale.headlineSm.fontFamily,
  },
  optionSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
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
