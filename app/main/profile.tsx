import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  IconHalo,
  TabBar,
} from '../../components/ui';
import type { GlyphName } from '../../components/ui';
import type { HaloTone } from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useHomeSnapshot } from '../../hooks/useUserData';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';

interface RowDef {
  key: string;
  icon: GlyphName;
  tone: HaloTone;
  title: string;
  sub: string;
  route?: string;
  badge?: string;
}

interface SubInfo {
  status: string;
  plan: string;
  trial_end: string | null;
  current_period_end: string | null;
}

const formatRowSub = (
  key: string,
  snap: ReturnType<typeof useHomeSnapshot>,
  sub: SubInfo | null,
  earliestPainDate: string | null,
): string => {
  const sessions = snap.streak?.total_sessions ?? 0;
  const streakDays = snap.streak?.current_streak ?? 0;
  if (key === 'progress') {
    if (sessions === 0) return 'Your first session is waiting';
    return `${sessions} session${sessions === 1 ? '' : 's'} · ${streakDays}-day streak`;
  }
  if (key === 'pain') {
    if (!earliestPainDate) return 'No ratings yet — start any time';
    const d = new Date(earliestPainDate);
    return `Daily ratings since ${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
  }
  if (key === 'sub') {
    if (!sub) return 'Free · all zones via shorts';
    if (sub.status === 'trialing' && sub.trial_end) {
      const days = Math.max(
        0,
        Math.ceil(
          (new Date(sub.trial_end).getTime() - Date.now()) / (24 * 3600 * 1000),
        ),
      );
      return `Trial · ${days} day${days === 1 ? '' : 's'} remaining`;
    }
    if (sub.status === 'active') return `${sub.plan.replace('_', ' ')} · billed automatically`;
    if (sub.status === 'expired' || sub.status === 'cancelled') return 'Plan ended — reactivate any time';
    return 'Free · all zones via shorts';
  }
  return '';
};

const rowBadgeFor = (status: string | undefined): string | undefined => {
  if (status === 'trialing') return 'TRIAL';
  if (status === 'active') return 'PRO';
  return undefined;
};

const tierBadgeFor = (status: string | undefined, isPremium: boolean): string | null => {
  if (status === 'trialing') return 'TRIAL';
  if (isPremium) return 'PRO';
  return null;
};

const headerSubFor = (snap: ReturnType<typeof useHomeSnapshot>): string => {
  const days = snap.streak?.current_streak ?? 0;
  const zones = snap.onboardingData.pain_zones ?? [];
  const focusLabel =
    zones.length === 0
      ? 'Building habits'
      : zones.length === 1
        ? `${capitalize(zones[0])} focus`
        : `${capitalize(zones[0])} & ${capitalize(zones[1])} focus`;
  return days === 0 ? focusLabel : `Day ${days} · ${focusLabel}`;
};

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const snap = useHomeSnapshot();
  const userId = useUserId();
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [earliestPain, setEarliestPain] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([
      supabase
        .from('deskcare_subscriptions')
        .select('status, plan, trial_end, current_period_end')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('pain_entries')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]).then(([subRes, painRes]) => {
      if (cancelled) return;
      if (subRes.data) setSub(subRes.data as SubInfo);
      if (painRes.data?.created_at) setEarliestPain(painRes.data.created_at as string);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const ROWS: ReadonlyArray<RowDef> = [
    {
      key: 'progress',
      icon: 'check',
      tone: 'coral',
      title: 'Progress',
      sub: formatRowSub('progress', snap, sub, earliestPain),
      route: '/profile/progress',
    },
    {
      key: 'pain',
      icon: 'infinity',
      tone: 'peach',
      title: 'Pain history',
      sub: formatRowSub('pain', snap, sub, earliestPain),
      route: '/profile/pain-history',
    },
    {
      key: 'settings',
      icon: 'settings',
      tone: 'lavender',
      title: 'Settings',
      sub: 'Reminders, account, privacy',
      route: '/profile/settings',
    },
    {
      key: 'sub',
      icon: 'crown',
      tone: 'coral',
      title: 'Subscription',
      sub: formatRowSub('sub', snap, sub, earliestPain),
      route: '/onboarding/paywall',
      badge: rowBadgeFor(sub?.status),
    },
  ];

  const open = (r: RowDef) => {
    Haptics.selectionAsync();
    if (r.route) router.push(r.route as never);
  };

  const displayName = snap.profile?.display_name ?? 'Friend';
  const initial = (displayName[0] ?? 'F').toUpperCase();
  const tierBadge = tierBadgeFor(sub?.status, snap.isPremium);
  const sessionsValue = String(snap.streak?.total_sessions ?? 0);
  const streakValue = String(snap.streak?.current_streak ?? 0);
  const minutesValue = String(snap.streak?.total_minutes ?? 0);

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={260} opacity={0.22} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + 130,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{initial}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.greeting}>{displayName}</Text>
            <Text style={styles.sub}>{headerSubFor(snap)}</Text>
          </View>
          {tierBadge && (
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{tierBadge}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsWrap}>
          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <View style={styles.statsRow}>
              <StatCol value={sessionsValue} label="SESSIONS" />
              <StatDivider />
              <StatCol value={streakValue} label="DAY STREAK" />
              <StatDivider />
              <StatCol value={minutesValue} label="MINUTES" />
            </View>
          </GlassCard>
        </View>

        <Eyebrow>MANAGE</Eyebrow>
        <View style={styles.rows}>
          {ROWS.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => open(r)}
              style={({ pressed }) => [pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={r.title}
            >
              <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                <View style={styles.row}>
                  <IconHalo icon={r.icon} size="md" tone={r.tone} variant="tinted" />
                  <View style={styles.rowText}>
                    <View style={styles.rowTitleRow}>
                      <Text style={styles.rowTitle}>{r.title}</Text>
                      {r.badge && (
                        <View style={styles.rowBadge}>
                          <Text style={styles.rowBadgeText}>{r.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.rowSub}>{r.sub}</Text>
                  </View>
                  <View style={styles.chevron}>
                    <Svg width={14} height={14} viewBox="0 0 14 14">
                      <Path d="M5 3 L9 7 L5 11" stroke={colors.inkSubtle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <TabBar current="profile" />
    </AtmosphericBackground>
  );
}

const StatCol: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.statCol}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StatDivider = () => <View style={styles.statDivider} />;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: colors.white,
    fontFamily: typeScale.headline.fontFamily,
    fontSize: 28,
  },
  greeting: {
    ...typeScale.headlineSm,
    color: colors.ink,
  },
  sub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  tierBadgeText: {
    ...typeScale.labelSm,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
  },
  statsWrap: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
  },
  statLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.inkHairline,
  },
  rows: {
    gap: spacing.sm,
    marginTop: spacing.md,
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
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  rowBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primaryMid,
  },
  rowBadgeText: {
    ...typeScale.labelSm,
    color: colors.white,
    textTransform: 'uppercase',
  },
  rowSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  chevron: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
