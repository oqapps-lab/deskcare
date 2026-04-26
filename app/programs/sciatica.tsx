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

interface PhaseRoutines {
  title: string;
  subtitle: string;
  /** Slugs of routines that belong to this phase (filtered from the sciatica body_zone). */
  routines: Routine[];
}

const INSIDE = [
  'Symptom check-in that adapts the program',
  'Red-flag screener for safety',
  'Every exercise with contraindications',
  'Weekly progress summary',
];

const formatMin = (s: number) => `${Math.round(s / 60)} MIN`;

export default function SciaticaProgramScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ active?: string }>();
  const userId = useUserId();
  const [acutePhase, setAcutePhase] = useState<PhaseRoutines>({
    title: 'Phase 1 · Acute',
    subtitle: 'Gentle · Days 1–7',
    routines: [],
  });
  const [maintPhase, setMaintPhase] = useState<PhaseRoutines>({
    title: 'Phase 2 · Maintenance',
    subtitle: 'Progressive · Days 8–21',
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

      <NavHeader title="Sciatica Relief" onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 220,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
          <Eyebrow variant="accent">SCIATICA RELIEF</Eyebrow>
          <Text style={styles.heroTitle}>
            {active ? 'Phase 1 · Day 4 of 7' : 'A calm 21-day return to standing without wincing.'}
          </Text>
          <Text style={styles.heroMeta}>2 PHASES · 14 EXERCISES · CLINICIAN-REVIEWED</Text>
          {active && (
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar value={4 / 7} accessibilityLabel="Program progress: day 4 of 7" />
            </View>
          )}
          <Text style={styles.disclaimer}>
            This does not replace medical advice. If you have red-flag symptoms,
            see a doctor.
          </Text>
        </GlassCard>

        <Pressable
          onPress={openCheckIn}
          style={({ pressed }) => [styles.checkInRow, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open symptom check-in"
        >
          <GlassCard tint="coral" radius="xl" padding={spacing.lg} innerGradient>
            <View style={styles.row}>
              <IconHalo icon="infinity" size="md" tone="coral" variant="gradient" glow />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.rowTitle}>How is it today?</Text>
                <Text style={styles.rowSub}>6-question check-in · adapts today's routine</Text>
              </View>
              <Svg width={16} height={16} viewBox="0 0 16 16">
                <Path d="M6 3 L11 8 L6 13" stroke={colors.primaryDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
          </GlassCard>
        </Pressable>

        <PhaseCard
          phase={acutePhase}
          meta={`DAYS 1–7 · ${acutePhase.routines.length} ROUTINES · ~3 MIN / DAY`}
          active={active}
          locked={!active}
        />

        <PhaseCard
          phase={maintPhase}
          meta={`DAYS 8–21 · ${maintPhase.routines.length} ROUTINES · ~5 MIN / DAY`}
          active={false}
          locked={!active}
          lockedCopy={active ? 'Unlocks on day 8' : undefined}
        />

        <Eyebrow>INSIDE YOU GET</Eyebrow>
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
            Begin today's session · 3 min
          </PillCTA>
        ) : (
          <>
            <PillCTA variant="primary" size="lg" breath onPress={unlock}>
              Unlock with 7-day free trial
            </PillCTA>
            <Pressable hitSlop={8} onPress={() => router.push('/onboarding/paywall')} accessibilityRole="button" accessibilityLabel="Learn more">
              <Text style={styles.learnMore}>Learn more about sciatica care</Text>
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
            <Text style={styles.lockedCopy}>Routines load momentarily…</Text>
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
