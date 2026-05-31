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
  ExerciseVideo,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useRoutineWithItems } from '../../hooks/useContent';
import { useCustomRoutineItems } from '../../hooks/useCustomRoutines';
import { t, i18nField } from '../../lib/i18n';
import { DEFAULT_ROUTINE_SLUG } from '../../constants/routines';

const DEFAULT_ROUTINE = DEFAULT_ROUTINE_SLUG;

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
  const params = useLocalSearchParams<{ routine?: string; custom?: string }>();
  const customId = params.custom as string | undefined;
  const routineSlug = customId ? undefined : ((params.routine as string) || DEFAULT_ROUTINE);

  // DB routine path
  const db = useRoutineWithItems(routineSlug);
  // Custom routine path (resolves the user's picked exercise slugs in order)
  const custom = useCustomRoutineItems(customId);

  const isCustom = !!customId;
  const items = isCustom ? custom.items : db.items;
  const loading = isCustom ? custom.loading : db.loading;
  const error = isCustom ? null : db.error;
  // A truthy "routine" so the success branch renders for both paths.
  const routine = isCustom ? custom.routine : db.routine;

  const displayTitle = isCustom
    ? (custom.routine?.name ?? t('cr_title'))
    : (db.routine ? i18nField(db.routine, 'title') : '');
  const displayDescription = isCustom ? '' : (db.routine ? i18nField(db.routine, 'description') : '');

  const totalSec = isCustom
    ? items.reduce((acc, it) => acc + (it.exercise?.duration_seconds ?? 0) * it.reps, 0)
    : (db.routine?.duration_seconds ?? 0);
  const totalMin = Math.max(1, Math.round(totalSec / 60));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };
  const begin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/exercise/player',
      params: isCustom ? { custom: customId } : { routine: routineSlug },
    } as never);
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
              {error ? t('preview_load_error', { error }) : t('preview_load_not_found')}
            </Text>
          </View>
        ) : (
          <>
            <Eyebrow variant="accent">{isCustom ? t('cr_title') : t('preview_eyebrow')}</Eyebrow>
            <Text style={styles.title}>{displayTitle}</Text>
            {!!displayDescription && <Text style={styles.sub}>{displayDescription}</Text>}

            <View style={styles.heroWrap}>
              <ExerciseVideo
                pose={poseFor(items[0]?.exercise?.code)}
                videoUrl={items[0]?.exercise?.video_url}
                width={300}
                height={400}
              />
            </View>

            <View style={styles.statsRow}>
              <StatCol value={`${totalMin}`} unit={t('preview_stat_min')} />
              <Sep />
              <StatCol value={`${items.length}`} unit={t('preview_stat_moves')} />
              <Sep />
              <StatCol
                value={
                  isCustom
                    ? t('cr_title')
                    : db.routine?.routine_type === 'zone_based'
                    ? t('preview_routine_type_zone_based')
                    : (db.routine?.routine_type ?? '')
                        .charAt(0).toUpperCase() +
                      (db.routine?.routine_type ?? '').slice(1).replace('_', ' ')
                }
                unit={t('preview_stat_type')}
              />
            </View>

            <Eyebrow>{t('preview_whatyoulldo')}</Eyebrow>
            <View style={styles.list}>
              {items.map((it, i) => (
                <View key={it.id} style={styles.row}>
                  <View style={styles.stepIndex}>
                    <Text style={styles.stepIndexText}>{i + 1}</Text>
                  </View>
                  <VideoPlaceholder pose={poseFor(it.exercise?.code)} compact />
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{i18nField(it.exercise, 'title') || (it.exercise?.code ?? '')}</Text>
                    <Text style={styles.rowMeta}>
                      {it.exercise?.code} · {it.reps}× ({(it.exercise?.duration_seconds ?? 0) * it.reps}s)
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
              <Text style={styles.tipTitle}>{t('preview_tip_title')}</Text>
              <Text style={styles.tipBody}>{t('preview_tip_body')}</Text>
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
          {routine ? t('preview_cta_begin_min', { min: totalMin }) : t('common_loading')}
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const StatCol: React.FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <View style={styles.statCol}>
    <Text
      style={styles.statValue}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.5}
      allowFontScaling={false}
    >
      {value}
    </Text>
    <Text style={styles.statUnit} numberOfLines={1}>{unit}</Text>
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
    minWidth: 0,
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
