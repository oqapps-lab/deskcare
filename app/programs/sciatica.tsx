import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  FloatingScrim,
  GlassCard,
  IconHalo,
  NavHeader,
  PillCTA,
  ProgressBar,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';
import type { Routine } from '../../lib/types/db';
import { t } from '../../lib/i18n';

interface PhaseRoutines {
  title: string;
  subtitle: string;
  /** Slugs of routines that belong to this phase (filtered from the sciatica body_zone). */
  routines: Routine[];
}

const INSIDE = [
  t('sciatica_feature_symptom'),
  t('sciatica_feature_redflag'),
  t('sciatica_feature_cautions'),
  t('sciatica_feature_weekly'),
];

const formatMin = (s: number) => `${Math.round(s / 60)} MIN`;

export default function SciaticaProgramScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ active?: string }>();
  const userId = useUserId();
  const [acutePhase, setAcutePhase] = useState<PhaseRoutines>({
    title: t('sciatica_phase_acute_title'),
    subtitle: t('sciatica_phase_acute_sub'),
    routines: [],
  });
  const [maintPhase, setMaintPhase] = useState<PhaseRoutines>({
    title: t('sciatica_phase_maint_title'),
    subtitle: t('sciatica_phase_maint_sub'),
    routines: [],
  });
  const [progressActive, setProgressActive] = useState<boolean | null>(null);
  const [, setLoading] = useState(true);

  // Fetch sciatica zone routines (R14-R17) split into acute / maintenance by slug prefix.
  // Plus user's program progress to drive `active` state when signed in.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const { data: zone } = await supabase
        .from('body_zones')
        .select('id')
        .eq('slug', 'sciatica')
        .maybeSingle();
      if (!zone?.id) return;
      const { data: routines } = await supabase
        .from('routines')
        .select('id, slug, title, description, body_zone_id, duration_seconds, is_premium, routine_type, sort_order')
        .eq('body_zone_id', zone.id)
        .order('sort_order');
      if (cancelled) return;
      const list = (routines as Routine[] | null) ?? [];
      setAcutePhase((p) => ({ ...p, routines: list.filter((r) => r.slug.startsWith('sciatica-acute-')) }));
      setMaintPhase((p) => ({ ...p, routines: list.filter((r) => r.slug.startsWith('sciatica-maint-')) }));

      if (userId) {
        const { data: progress } = await supabase
          .from('user_program_progress')
          .select('status, program_id, programs:programs!inner(slug)')
          .eq('user_id', userId)
          .filter('programs.slug', 'eq', 'sciatica')
          .maybeSingle();
        if (cancelled) return;
        setProgressActive(progress?.status === 'active');
      } else {
        setProgressActive(null);
      }
    };
    run().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Active state: explicit ?active=1 param wins (legacy / design preview).
  // Otherwise use user_program_progress when signed in.
  const active = params.active === '1' || progressActive === true;

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/programs');
  };
  const unlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding/paywall');
  };
  const todaysSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Pick today's first acute routine (gentle 3-min) as the day's session.
    const todays = acutePhase.routines[0]?.slug;
    router.push(
      todays
        ? ({ pathname: '/exercise/preview', params: { routine: todays } } as never)
        : '/exercise/preview',
    );
  };
  const openCheckIn = () => {
    Haptics.selectionAsync();
    router.push('/programs/symptom-checker');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.20} />

      <NavHeader title={t('nav_sciatica_relief')} onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 280,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
          <Eyebrow variant="accent">{t('sciatica_eb_relief')}</Eyebrow>
          <Text style={styles.heroTitle}>
            {active
              ? t('psc_hero_active', { day: 4, total: 7 })
              : t('sciatica_hero_inactive')}
          </Text>
          <Text style={styles.heroMeta}>{t('psc_meta_phases')}</Text>
          {active && (
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar value={4 / 7} accessibilityLabel={t('psc_progress_label', { day: 4, total: 7 })} />
            </View>
          )}
          <Text style={styles.disclaimer}>{t('psc_disclaimer')}</Text>
        </GlassCard>

        <Pressable
          onPress={openCheckIn}
          style={({ pressed }) => [styles.checkInRow, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t('psc_check_cta')}
        >
          <GlassCard tint="coral" radius="xl" padding={spacing.lg} innerGradient>
            <View style={styles.row}>
              <IconHalo icon="infinity" size="md" tone="coral" variant="gradient" glow />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle}>{t('psc_check_title')}</Text>
                <Text style={styles.rowSub}>{t('sciatica_check_in_sub')}</Text>
              </View>
              <Svg width={16} height={16} viewBox="0 0 16 16">
                <Path d="M6 3 L11 8 L6 13" stroke={colors.primaryDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
          </GlassCard>
        </Pressable>

        <PhaseCard
          phase={acutePhase}
          meta={t('sciatica_meta_acute', { n: acutePhase.routines.length })}
          active={active}
          locked={!active}
        />

        <PhaseCard
          phase={maintPhase}
          meta={t('sciatica_meta_maint', { n: maintPhase.routines.length })}
          active={false}
          locked={!active}
          lockedCopy={t('sciatica_locked_unlock_day8')}
        />

        <Eyebrow>{t('sciatica_eb_inside')}</Eyebrow>
        <View style={styles.insideList}>
          {INSIDE.map((line) => (
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
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
        {active ? (
          <PillCTA variant="primary" size="lg" icon="play" iconBg breath onPress={todaysSession}>
            {t('psc_cta_today')}
          </PillCTA>
        ) : (
          <>
            <PillCTA variant="primary" size="lg" breath onPress={unlock}>
              {t('libd_cta_unlock')}
            </PillCTA>
            <Pressable hitSlop={8} onPress={() => router.push('/onboarding/paywall')} accessibilityRole="button" accessibilityLabel={t('psc_learn_more_label')}>
              <Text style={styles.learnMore}>{t('psc_learn_more_label')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </AtmosphericBackground>
  );
}

const PhaseCard: React.FC<{
  phase: PhaseRoutines;
  meta: string;
  active: boolean;
  locked: boolean;
  lockedCopy?: string;
}> = ({ phase, meta, active, locked, lockedCopy }) => (
  <View style={styles.phaseWrap}>
    {/* Both phases get a peach base so they read as members of the same family.
        Active gets full innerGradient (warm), inactive gets the lighter peach
        without the inner glow so it still reads as "next up, not unlocked yet"
        without crashing into a stark cream rectangle. */}
    <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient={active} decorativeCorner={active}>
      <View style={styles.phaseHead}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.phaseTitle}>{phase.title}</Text>
          <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
        </View>
        {locked && (
          <View style={styles.keyChip}>
            <Svg width={12} height={12} viewBox="0 0 14 14">
              <Path d="M5 9 a3 3 0 1 1 4 0 L9 9 L12 12 L10 14 L9 13 L8 14 L7 13" stroke={colors.primaryMid} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </Svg>
          </View>
        )}
      </View>

      <Text style={styles.phaseMeta}>{meta}</Text>

      {active ? (
        <View style={styles.exercisesList}>
          {phase.routines.map((r, i) => (
            <View key={r.id} style={styles.exerciseRow}>
              <View style={[styles.exerciseDot, i < 1 && styles.exerciseDotDone]} />
              <Text style={[styles.exerciseName, i < 1 && styles.exerciseDone]}>{r.title}</Text>
              <Text style={styles.exerciseDur}>{formatMin(r.duration_seconds)}</Text>
            </View>
          ))}
          {phase.routines.length === 0 && (
            <Text style={styles.lockedCopy}>{t('psc_loading')}</Text>
          )}
        </View>
      ) : lockedCopy ? (
        <Text style={styles.lockedCopy}>{lockedCopy}</Text>
      ) : null}
    </GlassCard>
  </View>
);

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
  },
  checkInRow: {
    marginTop: spacing.lg,
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
  rowTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  rowSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  phaseWrap: {
    marginTop: spacing.xl,
  },
  phaseHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  phaseSubtitle: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  phaseMeta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  keyChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exercisesList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(232,123,78,0.22)',
  },
  exerciseDotDone: {
    backgroundColor: colors.primaryMid,
    borderColor: colors.primaryMid,
  },
  exerciseName: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  exerciseDone: {
    color: colors.inkMuted,
  },
  exerciseDur: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
  },
  lockedCopy: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    marginTop: spacing.md,
    fontStyle: 'italic',
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
  learnMore: {
    ...typeScale.bodySm,
    color: colors.primaryMid,
    marginTop: spacing.sm,
  },
});
