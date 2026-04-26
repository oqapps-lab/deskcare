import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';
import type { Streak } from '../../lib/types/db';

// Empty week — 7 zero bars with the right day labels. Used when the user
// hasn't logged a session yet so the chart still renders structurally.
const buildEmptyWeek = (): { day: string; min: number }[] => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const out: { day: string; min: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({ day: labels[d.getDay()], min: 0 });
  }
  return out;
};

interface SessionRow {
  id: string;
  started_at: string;
  duration_seconds: number;
  routine: { title: string } | null;
  body_zone: { name: string } | null;
}

const formatDur = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
};

const formatDateLabel = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - dDay.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const userId = useUserId();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase
        .from('streaks')
        .select('user_id, current_streak, longest_streak, last_activity_date, total_sessions, total_minutes')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('sessions')
        .select(
          'id, started_at, duration_seconds, ' +
            'routine:routines ( title ), body_zone:body_zones ( name )',
        )
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(20),
    ]).then(([s, list]) => {
      if (cancelled) return;
      setStreak((s.data as Streak) ?? null);
      setSessions((list.data as SessionRow[]) ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Build the weekly chart from real sessions when available; empty bars
  // (zero-min placeholder) when there are none yet.
  const weekChart = useMemo(() => {
    if (!sessions || sessions.length === 0) return buildEmptyWeek();
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    sessions.forEach((s) => {
      const key = s.started_at.slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + s.duration_seconds / 60);
      }
    });
    const entries: { day: string; min: number }[] = [];
    for (const [iso, min] of buckets.entries()) {
      const date = new Date(iso);
      entries.push({ day: DAY_LABELS[date.getDay()], min: Math.round(min * 10) / 10 });
    }
    return entries;
  }, [sessions]);

  const recentList = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    return sessions.slice(0, 5).map((s) => ({
      date: formatDateLabel(s.started_at),
      routine: s.routine?.title ?? 'Quick session',
      dur: formatDur(s.duration_seconds),
      zone: s.body_zone?.name ?? '—',
    }));
  }, [sessions]);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  const maxMin = Math.max(1, ...weekChart.map((d) => d.min));
  const totalSessions = streak?.total_sessions ?? 0;
  const currentStreak = streak?.current_streak ?? 0;
  const todayDayIdx = new Date().getDay(); // 0=Sun..6=Sat → index for week dot
  const dotIdx = (todayDayIdx + 6) % 7; // map to Mon-first row index

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
                <Text style={styles.bigNumber}>{totalSessions}</Text>
                <Text style={styles.bigLabel}>SESSIONS</Text>
              </View>
              <View style={styles.sep} />
              <View style={styles.topStatCol}>
                <Text style={styles.bigNumber}>{currentStreak}</Text>
                <Text style={styles.bigLabel}>DAY STREAK</Text>
              </View>
            </View>
            <View style={styles.weekDotsRow}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.weekDot,
                    i < dotIdx && styles.weekDotDone,
                    i === dotIdx && styles.weekDotToday,
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
              {weekChart.map((d) => {
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
          {recentList.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyTitle}>No sessions yet.</Text>
              <Text style={styles.historyEmptyBody}>
                Finish a routine and it'll show up here, oldest releases at the bottom.
              </Text>
            </View>
          ) : (
            recentList.map((h, i) => (
              <React.Fragment key={i}>
                <View style={styles.historyRow}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyText}>
                    <Text style={styles.historyRoutine}>{h.routine}</Text>
                    <Text style={styles.historyMeta}>{h.date} · {h.zone}</Text>
                  </View>
                  <Text style={styles.historyDur}>{h.dur}</Text>
                </View>
                {i < recentList.length - 1 && <View style={styles.historyDivider} />}
              </React.Fragment>
            ))
          )}
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
  historyEmpty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  historyEmptyTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  historyEmptyBody: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 280,
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
