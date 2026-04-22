import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
} from '../../components/ui';
import type { GlyphName } from '../../components/ui';
import type { HaloTone } from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

const ROUTINES: ReadonlyArray<{
  name: string;
  duration: string;
  icon: GlyphName;
  tone: HaloTone;
}> = [
  { name: 'Neck Unwind',         duration: '2 MIN',  icon: 'infinity', tone: 'coral' },
  { name: 'Lower Back Release',  duration: '3 MIN',  icon: 'refresh',  tone: 'peach' },
  { name: 'Eye Reset',           duration: '30 SEC', icon: 'eye',      tone: 'lavender' },
];

const NUMBERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '14', label: 'EXERCISES' },
  { value: '2',  label: 'MINUTES A DAY' },
  { value: '14', label: 'DAYS TO RESULTS' },
];

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const eyebrowOpacity = useSharedValue(0);
  const headOpacity = useSharedValue(0);
  const headY = useSharedValue(12);
  const routinesOpacity = useSharedValue(0);
  const routinesY = useSharedValue(16);
  const numbersOpacity = useSharedValue(0);
  const numbersScale = useSharedValue(0.94);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    const d = reduceMotion ? 0 : 120;
    eyebrowOpacity.value = withTiming(1, { duration: 320 });
    headOpacity.value = withDelay(d, withTiming(1, { duration: 460 }));
    headY.value = withDelay(d, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    routinesOpacity.value = withDelay(d * 2, withTiming(1, { duration: 520 }));
    routinesY.value = withDelay(d * 2, withTiming(0, { duration: 560, easing: Easing.out(Easing.cubic) }));
    numbersOpacity.value = withDelay(d * 4, withTiming(1, { duration: 520 }));
    numbersScale.value = withDelay(d * 4, withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(d * 5, withTiming(1, { duration: 420 }));
  }, [reduceMotion, eyebrowOpacity, headOpacity, headY, routinesOpacity, routinesY, numbersOpacity, numbersScale, ctaOpacity]);

  const eyebrowStyle = useAnimatedStyle(() => ({ opacity: eyebrowOpacity.value }));
  const headStyle = useAnimatedStyle(() => ({
    opacity: headOpacity.value,
    transform: [{ translateY: headY.value }],
  }));
  const routinesStyle = useAnimatedStyle(() => ({
    opacity: routinesOpacity.value,
    transform: [{ translateY: routinesY.value }],
  }));
  const numbersStyle = useAnimatedStyle(() => ({
    opacity: numbersOpacity.value,
    transform: [{ scale: numbersScale.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const cont = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding/permission');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={260} opacity={0.22} />
      <DecorativeArc position="bottom-left" tone="lavender" size={220} opacity={0.16} />

      <NavHeader onBack={back} />

      <View style={styles.wrap}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + 160,
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.eyebrowRow, eyebrowStyle]}>
            <Eyebrow variant="accent">BUILT FOR YOU</Eyebrow>
          </Animated.View>

          <Animated.View style={[styles.head, headStyle]}>
            <Text style={styles.title}>Your program{'\n'}is ready.</Text>
            <Text style={styles.sub}>
              Three short routines, picked for the zones you{'\n'}
              flagged. Gentle enough to do between tabs.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.routines, routinesStyle]}>
            {ROUTINES.map((r, i) => (
              <View key={r.name} style={styles.routineWrap}>
                <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                  <View style={styles.routineRow}>
                    <IconHalo
                      icon={r.icon}
                      size="md"
                      tone={r.tone}
                      variant="tinted"
                      glow={false}
                    />
                    <View style={styles.routineText}>
                      <Text style={styles.routineName}>{r.name}</Text>
                      <Text style={styles.routineHint}>
                        {i === 0 ? 'Based on your neck answers' : i === 1 ? 'Desk-posture counter' : 'Screen recovery'}
                      </Text>
                    </View>
                    <View style={styles.durationPill}>
                      <Text style={styles.durationText}>{r.duration}</Text>
                    </View>
                  </View>
                </GlassCard>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.numbersWrap, numbersStyle]}>
            <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
              <View style={styles.numbersRow}>
                {NUMBERS.map((n, i) => (
                  <React.Fragment key={n.label}>
                    <View style={styles.numberCol}>
                      <Text style={styles.numberValue}>{n.value}</Text>
                      <Text style={styles.numberLabel}>{n.label}</Text>
                    </View>
                    {i < NUMBERS.length - 1 && <View style={styles.numberDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[styles.ctaFloating, ctaStyle, { paddingBottom: insets.bottom + spacing.md }]}
          pointerEvents="box-none"
        >
          <PillCTA variant="primary" size="lg" icon="check" iconBg breath onPress={cont}>
            Continue
          </PillCTA>
        </Animated.View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  eyebrowRow: {
    marginBottom: spacing.md,
  },
  head: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  routines: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  routineWrap: {},
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  routineText: {
    flex: 1,
    minWidth: 0,
  },
  routineName: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  routineHint: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  durationPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  durationText: {
    ...typeScale.label,
    color: colors.primaryDeep,
  },
  numbersWrap: {},
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberCol: {
    flex: 1,
    alignItems: 'center',
  },
  numberValue: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
  },
  numberLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  numberDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.inkHairline,
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
