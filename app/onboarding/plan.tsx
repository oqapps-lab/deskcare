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
import { useOnboarding } from '../../lib/store/onboarding';
import { t } from '../../lib/i18n';
import { useUserId } from '../../lib/store/session';

type RoutineCard = {
  name: string;
  duration: string;
  hint: string;
  icon: GlyphName;
  tone: HaloTone;
};

// Build the personalized 3-card plan from the user's picked zones. Each
// zone maps to a body-targeted routine; if the user picked fewer than 3
// zones (or "everything"), we fill with the defaults so the screen always
// shows three cards.
const ZONE_TO_ROUTINE: Record<string, RoutineCard> = {
  neck:      { name: t('onb_plan_routine_neck'),      duration: '2 MIN',  hint: t('plan_step_neck'),     icon: 'infinity', tone: 'coral' },
  back:      { name: t('onb_plan_routine_back'),      duration: '3 MIN',  hint: t('plan_step_posture'),  icon: 'refresh',  tone: 'peach' },
  eyes:      { name: t('onb_plan_routine_eyes'),      duration: '30 SEC', hint: t('plan_step_recovery'), icon: 'eye',      tone: 'lavender' },
  shoulders: { name: t('onb_plan_routine_shoulders'), duration: '2 MIN',  hint: t('plan_step_shoulders'),icon: 'plus',     tone: 'peach' },
  wrists:    { name: t('onb_plan_routine_wrists'),    duration: '1 MIN',  hint: t('plan_step_wrists'),   icon: 'plus',     tone: 'mint' },
};

const DEFAULT_ZONES = ['neck', 'back', 'eyes'] as const;

const buildPlanFor = (zones: ReadonlyArray<string>): RoutineCard[] => {
  const picked = (zones ?? []).filter((z) => z in ZONE_TO_ROUTINE);
  const all: string[] = [];
  for (const z of picked) if (!all.includes(z)) all.push(z);
  for (const d of DEFAULT_ZONES) if (all.length < 3 && !all.includes(d)) all.push(d);
  return all.slice(0, 3).map((z) => ZONE_TO_ROUTINE[z]);
};

const NUMBERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '14', label: t('onb_plan_stat_exercises') },
  { value: '2',  label: t('onb_plan_stat_min_per_day') },
  { value: '14', label: t('onb_plan_stat_days_to_results') },
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

  const userId = useUserId();
  const saveOnboarding = useOnboarding((s) => s.saveToSupabase);
  const resetOnboarding = useOnboarding((s) => s.reset);
  const painZones = useOnboarding((s) => s.pain_zones);
  const routines = buildPlanFor(painZones);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/onboarding/welcome');
  };
  const cont = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Best-effort persist quiz answers; anon users no-op via the store helper.
    await saveOnboarding(userId);
    resetOnboarding();
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
            <Eyebrow variant="accent">{t('onb_plan_eyebrow')}</Eyebrow>
          </Animated.View>

          <Animated.View style={[styles.head, headStyle]}>
            <Text style={styles.title}>{t('onb_plan_title')}</Text>
            <Text style={styles.sub}>{t('onb_plan_sub')}</Text>
          </Animated.View>

          <Animated.View style={[styles.routines, routinesStyle]}>
            {routines.map((r) => (
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
                      <Text style={styles.routineHint}>{r.hint}</Text>
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
                      <Text
                        style={styles.numberValue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.5}
                        allowFontScaling={false}
                      >
                        {n.value}
                      </Text>
                      <Text
                        style={styles.numberLabel}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {n.label}
                      </Text>
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
            {t('onb_plan_cta')}
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
    minWidth: 0,
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
