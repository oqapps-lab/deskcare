import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, typeScale } from '../constants/tokens';
import { GlassCard } from './ui';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAchievements } from '../hooks/useAchievements';
import { t } from '../lib/i18n';

/**
 * "Your week" home widget — combines a 7-day activity mini bar-chart with
 * streak + achievements at a glance. Tappable → full Analytics screen.
 * Added 2026-05-31 per tester ask for a workout graph + achievements block
 * on home. Reuses useAnalytics (daily sessions) + useAchievements (earned).
 */
export const HomeProgressCard: React.FC = () => {
  const a = useAnalytics();
  const { achievements } = useAchievements();

  // Last 7 days of the 14-day series.
  const week = a.daily.slice(-7);
  const maxSessions = Math.max(1, ...week.map((d) => d.sessions));
  const earned = (achievements ?? []).filter((x) => x.earned_at).length;
  const totalAch = (achievements ?? []).length;

  const open = () => {
    Haptics.selectionAsync();
    router.push('/analytics' as never);
  };

  // Weekday initials for the 7 bars (local).
  const dayLetter = (ymd: string) => {
    const d = new Date(ymd + 'T00:00:00');
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
  };

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrap}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={t('home_progress_a11y')}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <GlassCard tint="cream" radius="xl" padding={spacing.lg} innerGradient decorativeCorner>
          <View style={styles.headerRow}>
            <Text style={styles.eyebrow}>{t('home_progress_eyebrow')}</Text>
            <Text style={styles.link}>{t('home_progress_link')}</Text>
          </View>

          {/* 7-day mini bar chart */}
          <View style={styles.chart}>
            {week.map((d, i) => {
              const ratio = d.sessions / maxSessions;
              const h = Math.max(6, Math.round(ratio * 56));
              const isToday = i === week.length - 1;
              return (
                <View key={d.date} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      { height: h, backgroundColor: d.sessions > 0 ? colors.primaryMid : colors.inkHairline },
                      isToday && d.sessions > 0 && styles.barToday,
                    ]}
                  />
                  <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{dayLetter(d.date)}</Text>
                </View>
              );
            })}
          </View>

          {/* Stat strip */}
          <View style={styles.statsRow}>
            <Stat value={String(a.currentStreak)} label={t('home_progress_stat_streak')} />
            <View style={styles.statSep} />
            <Stat value={String(a.totalSessions)} label={t('home_progress_stat_sessions')} />
            <View style={styles.statSep} />
            <Stat value={`${earned}/${totalAch || '—'}`} label={t('home_progress_stat_badges')} />
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    // Uniform Home section gap (tester T4) — see StoriesRail.wrap note.
    marginTop: spacing.xxl,
    marginBottom: 0,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
  },
  link: {
    ...typeScale.labelSm,
    color: colors.primaryMid,
    textTransform: 'uppercase',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 72,
    gap: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: '78%',
    borderRadius: 6,
  },
  barToday: {
    backgroundColor: colors.primaryDeep,
  },
  barLabel: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
  },
  barLabelToday: {
    color: colors.primaryDeep,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.inkHairline,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  statLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: colors.inkHairline,
  },
});
