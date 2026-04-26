import React from 'react';
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

interface RowDef {
  key: string;
  icon: GlyphName;
  tone: HaloTone;
  title: string;
  sub: string;
  route?: string;
  badge?: string;
}

const ROWS: ReadonlyArray<RowDef> = [
  { key: 'progress', icon: 'check',    tone: 'coral',    title: 'Progress',     sub: '14 sessions · 6-day streak', route: '/profile/progress' },
  { key: 'pain',     icon: 'infinity', tone: 'peach',    title: 'Pain history', sub: 'Daily ratings since April 8', route: '/profile/pain-history' },
  { key: 'settings', icon: 'settings', tone: 'lavender', title: 'Settings',     sub: 'Reminders, account, privacy', route: '/profile/settings' },
  { key: 'sub',      icon: 'crown',    tone: 'coral',    title: 'Subscription', sub: 'Trial · 4 days remaining',    route: '/onboarding/paywall', badge: 'TRIAL' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const open = (r: RowDef) => {
    Haptics.selectionAsync();
    if (r.route) router.push(r.route as never);
  };

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
            <Text style={styles.avatarLetter}>M</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.greeting}>Marina</Text>
            <Text style={styles.sub}>Day 6 · Neck & Back focus</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>TRIAL</Text>
          </View>
        </View>

        <View style={styles.statsWrap}>
          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <View style={styles.statsRow}>
              <StatCol value="14" label="SESSIONS" />
              <StatDivider />
              <StatCol value="6" label="DAY STREAK" />
              <StatDivider />
              <StatCol value="38" label="MINUTES" />
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
