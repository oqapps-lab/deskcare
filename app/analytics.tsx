import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  GlassCard,
  NavHeader,
} from '../components/ui';
import { colors, spacing, typeScale } from '../constants/tokens';
import { useAnalytics } from '../hooks/useAnalytics';
import { t } from '../lib/i18n';

const BAR_HEIGHT = 90;

const Bars: React.FC<{ daily: { date: string; sessions: number }[] }> = ({ daily }) => {
  const max = Math.max(1, ...daily.map((d) => d.sessions));
  return (
    <View style={styles.barsRow}>
      {daily.map((d) => {
        const ratio = d.sessions / max;
        const h = Math.max(4, Math.round(ratio * BAR_HEIGHT));
        const lastInWeek = new Date(d.date + 'T00:00:00').getDay() === 0;
        return (
          <View key={d.date} style={styles.barCol}>
            <View style={[styles.barFill, { height: h, backgroundColor: ratio === 0 ? colors.inkHairline : colors.primaryMid }]} />
            <Text style={[styles.barLabel, lastInWeek && { color: colors.primaryDeep }]}>{new Date(d.date + 'T00:00:00').getDate()}</Text>
          </View>
        );
      })}
    </View>
  );
};

const ZoneBar: React.FC<{ name: string; minutes: number; max: number; tone: string }> = ({ name, minutes, max, tone }) => {
  const pct = max > 0 ? minutes / max : 0;
  return (
    <View style={styles.zoneRow}>
      <Text style={styles.zoneName} numberOfLines={1}>{name}</Text>
      <View style={styles.zoneTrack}>
        <View style={[styles.zoneFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: tone }]} />
      </View>
      <Text style={styles.zoneMin}>{minutes}m</Text>
    </View>
  );
};

const zoneTones: Record<string, string> = {
  neck: colors.primaryMid,
  back: '#9BC3AE',
  eyes: '#A9A5D6',
  wrists: '#E1B894',
  full_body: '#C58F6B',
  sciatica: colors.primary,
};

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const a = useAnalytics();

  const maxZoneMin = Math.max(1, ...a.zoneBreakdown.map((z) => z.minutes));

  const painCopy = (() => {
    if (a.painDelta === null || !a.painZoneName) return null;
    if (a.painDelta < -5) return t('an_pain_better', { zone: a.painZoneName, pct: Math.abs(a.painDelta) });
    if (a.painDelta > 5)  return t('an_pain_worse',  { zone: a.painZoneName, pct: a.painDelta });
    return t('an_pain_steady', { zone: a.painZoneName });
  })();

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="lavender" size={220} opacity={0.18} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <NavHeader showBack onBack={() => router.back()} title="" />

        <Text style={styles.eyebrow}>{t('an_eyebrow')}</Text>
        <Text style={styles.title}>{t('an_title')}</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.huge, paddingTop: spacing.lg }}
          style={{ flex: 1 }}
        >
          {/* KPI row */}
          <Animated.View entering={FadeInUp.duration(280)}>
            <View style={styles.kpiRow}>
              <GlassCard tint="cream" radius="xl" padding={spacing.lg} style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{a.totalSessions}</Text>
                <Text style={styles.kpiLabel}>{t('an_kpi_sessions')}</Text>
              </GlassCard>
              <GlassCard tint="peach" radius="xl" padding={spacing.lg} style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{a.totalMinutes}</Text>
                <Text style={styles.kpiLabel}>{t('an_kpi_minutes')}</Text>
              </GlassCard>
            </View>
            <View style={styles.kpiRow}>
              <GlassCard tint="coral" radius="xl" padding={spacing.lg} style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{a.currentStreak}</Text>
                <Text style={styles.kpiLabel}>{t('an_kpi_streak')}</Text>
              </GlassCard>
              <GlassCard tint="mint" radius="xl" padding={spacing.lg} style={styles.kpiCard}>
                <Text style={styles.kpiValue}>{a.longestStreak}</Text>
                <Text style={styles.kpiLabel}>{t('an_kpi_best')}</Text>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Daily sessions chart */}
          <Animated.View entering={FadeInDown.delay(120).duration(320)}>
            <GlassCard tint="cream" radius="xl" padding={spacing.lg} style={{ marginTop: spacing.lg }}>
              <Text style={styles.sectionEyebrow}>{t('an_chart_eyebrow')}</Text>
              <Text style={styles.sectionTitle}>{t('an_chart_title')}</Text>
              <Bars daily={a.daily.map((d) => ({ date: d.date, sessions: d.sessions }))} />
            </GlassCard>
          </Animated.View>

          {/* Zone breakdown */}
          {a.zoneBreakdown.length > 0 && (
            <Animated.View entering={FadeInDown.delay(220).duration(320)}>
              <GlassCard tint="peach" radius="xl" padding={spacing.lg} style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionEyebrow}>{t('an_zones_eyebrow')}</Text>
                <Text style={styles.sectionTitle}>{t('an_zones_title')}</Text>
                <View style={{ marginTop: spacing.md }}>
                  {a.zoneBreakdown.slice(0, 6).map((z) => (
                    <ZoneBar key={z.slug} name={z.name} minutes={z.minutes} max={maxZoneMin} tone={zoneTones[z.slug] || colors.primaryMid} />
                  ))}
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Pain insight */}
          {painCopy && (
            <Animated.View entering={FadeInDown.delay(320).duration(320)}>
              <GlassCard tint="lavender" radius="xl" padding={spacing.lg} style={{ marginTop: spacing.lg }}>
                <Text style={styles.sectionEyebrow}>{t('an_insight_eyebrow')}</Text>
                <Text style={styles.insightCopy}>{painCopy}</Text>
              </GlassCard>
            </Animated.View>
          )}

          {a.loading && (
            <Text style={styles.muted}>{t('an_loading')}</Text>
          )}
          {!a.loading && a.totalSessions === 0 && (
            <Animated.View entering={FadeInDown.duration(320)}>
              <GlassCard tint="cream" radius="xl" padding={spacing.xl} style={{ marginTop: spacing.lg }}>
                <Text style={styles.emptyTitle}>{t('an_empty_title')}</Text>
                <Text style={styles.emptyBody}>{t('an_empty_body')}</Text>
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginTop: spacing.sm,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
  },
  kpiValue: {
    ...typeScale.display,
    fontSize: 40,
    lineHeight: 44,
    color: colors.ink,
  },
  kpiLabel: {
    ...typeScale.label,
    color: colors.inkSubtle,
    marginTop: 2,
  },
  sectionEyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
  },
  sectionTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginTop: 2,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_HEIGHT + 20,
    marginTop: spacing.md,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barFill: {
    width: 10,
    borderRadius: 5,
    minHeight: 4,
  },
  barLabel: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  zoneName: {
    ...typeScale.bodySm,
    color: colors.ink,
    width: 76,
  },
  zoneTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.inkHairline,
    overflow: 'hidden',
  },
  zoneFill: {
    height: '100%',
    borderRadius: 4,
  },
  zoneMin: {
    ...typeScale.label,
    color: colors.inkMuted,
    width: 40,
    textAlign: 'right',
  },
  insightCopy: {
    ...typeScale.body,
    color: colors.ink,
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  muted: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    textAlign: 'center',
    paddingVertical: spacing.huge,
  },
  emptyTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  emptyBody: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
