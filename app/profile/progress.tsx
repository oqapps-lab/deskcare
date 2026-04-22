import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  NavHeader,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

const WEEK = [
  { day: 'Mon', min: 3.5 },
  { day: 'Tue', min: 2 },
  { day: 'Wed', min: 4 },
  { day: 'Thu', min: 2.5 },
  { day: 'Fri', min: 5 },
  { day: 'Sat', min: 1.5 },
  { day: 'Sun', min: 3 },
];

const HISTORY = [
  { date: 'Today',      routine: 'Neck Unwind',          dur: '2:15', zone: 'Neck' },
  { date: 'Yesterday',  routine: 'Eye Reset',            dur: '0:30', zone: 'Eyes' },
  { date: 'Apr 19',     routine: 'Lower Back Release',   dur: '3:05', zone: 'Back' },
  { date: 'Apr 18',     routine: 'Neck Unwind',          dur: '2:10', zone: 'Neck' },
  { date: 'Apr 17',     routine: 'Wrist Flex & Extend',  dur: '2:00', zone: 'Wrists' },
];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  const maxMin = Math.max(...WEEK.map((d) => d.min));

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader title="Progress" onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topStats}>
          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <View style={styles.topStatsRow}>
              <View style={styles.topStatCol}>
                <Text style={styles.bigNumber}>14</Text>
                <Text style={styles.bigLabel}>SESSIONS</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.topStatCol}>
                <Text style={styles.bigNumber}>6</Text>
                <Text style={styles.bigLabel}>DAY STREAK</Text>
              </View>
            </View>
            <View style={styles.weekDotsRow}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.weekDot,
                    i < 5 && styles.weekDotDone,
                    i === 5 && styles.weekDotToday,
                  ]}
                />
              ))}
            </View>
          </GlassCard>
        </View>

        <Eyebrow>THIS WEEK</Eyebrow>
        <View style={styles.chartWrap}>
          <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
            <View style={styles.chartRow}>
              {WEEK.map((d) => {
                const height = Math.max(6, (d.min / maxMin) * 100);
                const done = d.min > 0;
                return (
                  <View key={d.day} style={styles.chartCol}>
                    <View style={styles.chartBarWrap}>
                      <View
                        style={[
                          styles.chartBar,
                          { height },
                          done ? styles.chartBarDone : styles.chartBarEmpty,
                        ]}
                      />
                    </View>
                    <Text style={styles.chartDayLabel}>{d.day}</Text>
                    <Text style={styles.chartMin}>{d.min > 0 ? `${d.min}m` : '—'}</Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        </View>

        <Eyebrow>RECENT SESSIONS</Eyebrow>
        <View style={styles.history}>
          {HISTORY.map((h, i) => (
            <React.Fragment key={i}>
              <View style={styles.historyRow}>
                <View style={styles.historyDot} />
                <View style={styles.historyText}>
                  <Text style={styles.historyRoutine}>{h.routine}</Text>
                  <Text style={styles.historyMeta}>{h.date} · {h.zone}</Text>
                </View>
                <Text style={styles.historyDur}>{h.dur}</Text>
              </View>
              {i < HISTORY.length - 1 && <View style={styles.historyDivider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  topStats: {
    marginBottom: spacing.xl,
  },
  topStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.2,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
  },
  bigLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  sep: {
    width: 1,
    height: 40,
    backgroundColor: colors.inkHairline,
  },
  weekDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primarySoft,
  },
  weekDotDone: {
    backgroundColor: colors.primaryMid,
  },
  weekDotToday: {
    backgroundColor: colors.primaryDeep,
    transform: [{ scale: 1.15 }],
  },
  chartWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarWrap: {
    height: 100,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 14,
    borderRadius: 7,
  },
  chartBarDone: {
    backgroundColor: colors.primaryMid,
  },
  chartBarEmpty: {
    backgroundColor: colors.surfaceHighest,
  },
  chartDayLabel: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  chartMin: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  history: {
    marginTop: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMid,
  },
  historyText: {
    flex: 1,
    minWidth: 0,
  },
  historyRoutine: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  historyMeta: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  historyDur: {
    ...typeScale.label,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
  },
  historyDivider: {
    height: 1,
    backgroundColor: colors.inkHairline,
  },
});
