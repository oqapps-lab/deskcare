import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useRoutineWithItems } from '../../hooks/useContent';

const DEFAULT_ROUTINE = 'neck-quick-2min';

const poseFor = (code: string | undefined): 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch' => {
  if (!code) return 'neck-roll';
  if (code.startsWith('N')) return 'neck-roll';
  if (code.startsWith('B') || code.startsWith('S') || code.startsWith('F')) return 'back-arch';
  if (code.startsWith('W')) return 'wrist-stretch';
  if (code.startsWith('E')) return 'eye-rest';
  return 'neck-roll';
};

export default function RoutinePreviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ routine?: string }>();
  const routineSlug = (params.routine as string) || DEFAULT_ROUTINE;
  const { routine, items, loading, error } = useRoutineWithItems(routineSlug);

  const totalSec = routine?.duration_seconds ?? 0;
  const totalMin = Math.max(1, Math.round(totalSec / 60));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const begin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({ pathname: '/exercise/player', params: { routine: routineSlug } } as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.20} />

      <NavHeader onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && !routine ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator color={colors.primaryMid} />
          </View>
        ) : error || !routine ? (
          <View style={styles.statusWrap}>
            <Text style={styles.statusError}>
              {error ? `Could not load routine: ${error}` : 'Routine not found.'}
            </Text>
          </View>
        ) : (
          <>
            <Eyebrow variant="accent">TODAY'S ROUTINE</Eyebrow>
            <Text style={styles.title}>{routine.title}</Text>
            {routine.description && <Text style={styles.sub}>{routine.description}</Text>}

            <View style={styles.heroWrap}>
              <VideoPlaceholder pose={poseFor(items[0]?.exercise?.code)} width={320} height={200} />
            </View>

            <View style={styles.statsRow}>
              <StatCol value={`${totalMin}`} unit="MIN" />
              <Sep />
              <StatCol value={`${items.length}`} unit="MOVES" />
              <Sep />
              <StatCol value={routine.routine_type.replace('_', ' ').toUpperCase()} unit="TYPE" />
            </View>

            <Eyebrow>WHAT YOU'LL DO</Eyebrow>
            <View style={styles.list}>
              {items.map((it, i) => (
                <View key={it.id} style={styles.row}>
                  <View style={styles.stepIndex}>
                    <Text style={styles.stepIndexText}>{i + 1}</Text>
                  </View>
                  <VideoPlaceholder pose={poseFor(it.exercise?.code)} compact />
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{it.exercise?.title_en ?? it.exercise?.title ?? it.exercise?.code}</Text>
                    <Text style={styles.rowMeta}>
                      {it.exercise?.code} · {it.reps}× ({(it.exercise?.duration_seconds ?? 0) * it.reps}s)
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
              <Text style={styles.tipTitle}>Before you start</Text>
              <Text style={styles.tipBody}>
                Soften your shoulders. Breathe slowly through the nose. Stop at the
                first hint of sharp pain.
              </Text>
            </GlassCard>
          </>
        )}
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
        <PillCTA
          variant="primary"
          size="lg"
          icon="play"
          iconBg
          breath={!loading && !!routine}
          disabled={loading || !routine}
          onPress={begin}
        >
          {routine ? `Begin · ${totalMin} min` : 'Loading…'}
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const StatCol: React.FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <View style={styles.statCol}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statUnit}>{unit}</Text>
  </View>
);

const Sep = () => <View style={styles.sep} />;

const styles = StyleSheet.create({
  statusWrap: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  statusError: {
    ...typeScale.bodySm,
    color: colors.error,
    textAlign: 'center',
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
    letterSpacing: -0.5,
  },
  statUnit: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sep: {
    width: 1,
    height: 28,
    backgroundColor: colors.inkHairline,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: {
    ...typeScale.labelSm,
    color: colors.white,
    fontFamily: typeScale.titleLg.fontFamily,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  rowMeta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tipTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  tipBody: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    alignItems: 'center',
  },
});
