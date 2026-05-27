import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  FloatingScrim,
  GlassCard,
  NavHeader,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useIsPremium } from '../../lib/premium';
import type { Routine } from '../../lib/types/db';
import { t } from '../../lib/i18n';

interface PlanDef {
  slug?: string;
  /** i18n key for the day's title and detail. */
  titleKey: string;
  detailKey: string;
  minutes: number;
}

const PLAN: PlanDef[] = [
  { slug: 'wrists-quick-2min',  titleKey: 'prog_carpal_day1_title', detailKey: 'prog_carpal_day1_detail', minutes: 2 },
  { slug: 'wrists-relief-2min', titleKey: 'prog_carpal_day2_title', detailKey: 'prog_carpal_day2_detail', minutes: 2 },
  {                             titleKey: 'prog_carpal_day3_title', detailKey: 'prog_carpal_day3_detail', minutes: 3 },
  {                             titleKey: 'prog_carpal_day4_title', detailKey: 'prog_carpal_day4_detail', minutes: 4 },
  {                             titleKey: 'prog_carpal_day5_title', detailKey: 'prog_carpal_day5_detail', minutes: 4 },
  {                             titleKey: 'prog_carpal_day6_title', detailKey: 'prog_carpal_day6_detail', minutes: 3 },
  {                             titleKey: 'prog_carpal_day7_title', detailKey: 'prog_carpal_day7_detail', minutes: 5 },
];

const FEATURE_KEYS = [
  'prog_carpal_feat_1',
  'prog_carpal_feat_2',
  'prog_carpal_feat_3',
  'prog_carpal_feat_4',
];

export default function CarpalTunnelProgramScreen() {
  const insets = useSafeAreaInsets();
  const isPremium = useIsPremium();
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const { data: zone } = await supabase
        .from('body_zones')
        .select('id')
        .eq('slug', 'wrists')
        .maybeSingle();
      if (!zone?.id) return;
      const { data } = await supabase
        .from('routines')
        .select('id, slug, title, description, body_zone_id, duration_seconds, is_premium, routine_type, sort_order')
        .eq('body_zone_id', zone.id)
        .order('sort_order');
      if (cancelled) return;
      setRoutines((data as Routine[]) || []);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/programs');
  };

  const start = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!isPremium) {
      router.push('/onboarding/paywall' as never);
      return;
    }
    // Open the first session's preview as the entry point.
    const first = PLAN.find((p) => p.slug)?.slug;
    if (first) {
      router.push({ pathname: '/exercise/preview', params: { routine: first } } as never);
    } else {
      router.push('/main/programs');
    }
  };

  const openSession = (s: PlanDef) => {
    if (!s.slug) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.selectionAsync();
    if (!isPremium) {
      router.push('/onboarding/paywall' as never);
      return;
    }
    router.push({ pathname: '/exercise/preview', params: { routine: s.slug } } as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="peach" />
      <DecorativeArc position="top-right" tone="mint" size={240} opacity={0.20} />

      <NavHeader title={t('prog_carpal_title')} onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 240,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(280)}>
          <GlassCard tint="mint" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <Eyebrow variant="accent">{t('prog_carpal_eyebrow')}</Eyebrow>
            <Text style={styles.heroTitle}>{t('prog_carpal_hero')}</Text>
            <Text style={styles.heroMeta}>{t('prog_carpal_screen_meta')}</Text>
            <Text style={styles.disclaimer}>{t('prog_carpal_disclaimer')}</Text>
          </GlassCard>
        </Animated.View>

        <Eyebrow style={{ marginTop: spacing.xl }}>{t('prog_carpal_plan_eyebrow')}</Eyebrow>

        <View style={styles.sessionList}>
          {PLAN.map((s, i) => {
            const title = t(s.titleKey);
            const detail = t(s.detailKey);
            return (
              <Animated.View key={s.titleKey} entering={FadeInDown.delay(60 + i * 60).duration(280)}>
                <Pressable
                  onPress={() => openSession(s)}
                  accessibilityRole="button"
                  accessibilityLabel={`${title}, ${s.minutes} minutes`}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <GlassCard tint={i % 2 === 0 ? 'cream' : 'mint'} radius="xl" padding={spacing.lg}>
                    <View style={styles.row}>
                      <View style={styles.dayBubble}>
                        <Text style={styles.dayNum}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.sessionTitle}>{title}</Text>
                        <Text style={styles.sessionDetail}>{detail}</Text>
                      </View>
                      <Text style={styles.duration}>{s.minutes} MIN</Text>
                    </View>
                  </GlassCard>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Eyebrow style={{ marginTop: spacing.xl }}>{t('prog_carpal_inside_eyebrow')}</Eyebrow>
        <View style={styles.insideList}>
          {FEATURE_KEYS.map((key) => (
            <View key={key} style={styles.insideRow}>
              <View style={styles.check}>
                <Svg width={12} height={12} viewBox="0 0 12 12">
                  <Path d="M2.5 6.5 L5 9 L9.5 3.5" stroke={colors.primaryDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </View>
              <Text style={styles.insideText}>{t(key)}</Text>
            </View>
          ))}
        </View>

        {routines.length === 0 && (
          <Text style={styles.softFooter}>{t('prog_carpal_content_note')}</Text>
        )}
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
        <PillCTA
          variant="primary"
          size="lg"
          icon="play"
          iconBg
          breath
          onPress={start}
        >
          {isPremium ? t('prog_carpal_cta_start') : t('libd_cta_unlock')}
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    ...typeScale.headlineSm,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  heroMeta: {
    ...typeScale.labelSm,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  disclaimer: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  sessionList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    ...typeScale.titleLg,
    color: colors.primaryDeep,
  },
  sessionTitle: {
    ...typeScale.title,
    color: colors.ink,
  },
  sessionDetail: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  duration: {
    ...typeScale.label,
    color: colors.inkSubtle,
  },
  insideList: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  insideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insideText: {
    ...typeScale.body,
    color: colors.inkMuted,
    flex: 1,
    minWidth: 0,
  },
  softFooter: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
});
