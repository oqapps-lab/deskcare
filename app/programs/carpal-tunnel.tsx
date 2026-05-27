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

interface SessionDef {
  /** Slug to route into preview if it exists in routines table; else stay as info-only. */
  slug?: string;
  title: string;
  detail: string;
  minutes: number;
}

const PLAN: SessionDef[] = [
  { slug: 'wrists-quick-2min',  title: 'Day 1 — Median nerve glides',  detail: 'Gentle 6-position slide of the median nerve through the carpal tunnel.', minutes: 2 },
  { slug: 'wrists-relief-2min', title: 'Day 2 — Tendon glides',        detail: 'Fist → hook → flat → straight to mobilize each finger tendon.',           minutes: 2 },
  { title: 'Day 3 — Wrist flex / extend',                              detail: 'Slow stretch holds in both directions, 30s each side.',                    minutes: 3 },
  { title: 'Day 4 — Combined glides',                                  detail: 'Nerve + tendon glides chained for full circulation.',                      minutes: 4 },
  { title: 'Day 5 — Eccentric strengthening',                          detail: 'Resisted wrist drops to load the forearm flexors safely.',                 minutes: 4 },
  { title: 'Day 6 — Active recovery',                                  detail: 'Light circles + decompression hangs, no resistance.',                      minutes: 3 },
  { title: 'Day 7 — Full protocol',                                    detail: 'Run the whole sequence end-to-end as your habit anchor.',                  minutes: 5 },
];

const FEATURES = [
  '8 progressive sessions over 7 days',
  'Nerve + tendon glides backed by hand-therapy literature',
  'Contraindications + when to see a doctor',
  'Track symptoms across the program',
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

  const openSession = (s: SessionDef) => {
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
          {PLAN.map((s, i) => (
            <Animated.View key={s.title} entering={FadeInDown.delay(60 + i * 60).duration(280)}>
              <Pressable
                onPress={() => openSession(s)}
                accessibilityRole="button"
                accessibilityLabel={`${s.title}, ${s.minutes} minutes`}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <GlassCard tint={i % 2 === 0 ? 'cream' : 'mint'} radius="xl" padding={spacing.lg}>
                  <View style={styles.row}>
                    <View style={styles.dayBubble}>
                      <Text style={styles.dayNum}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.sessionTitle}>{s.title}</Text>
                      <Text style={styles.sessionDetail}>{s.detail}</Text>
                    </View>
                    <Text style={styles.duration}>{s.minutes} MIN</Text>
                  </View>
                </GlassCard>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Eyebrow style={{ marginTop: spacing.xl }}>{t('prog_carpal_inside_eyebrow')}</Eyebrow>
        <View style={styles.insideList}>
          {FEATURES.map((line) => (
            <View key={line} style={styles.insideRow}>
              <View style={styles.check}>
                <Svg width={12} height={12} viewBox="0 0 12 12">
                  <Path d="M2.5 6.5 L5 9 L9.5 3.5" stroke={colors.primaryDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </View>
              <Text style={styles.insideText}>{line}</Text>
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
