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
  NavHeader,
  ToggleSwitch,
} from '../../components/ui';
import type { GlyphName } from '../../components/ui';
import type { HaloTone } from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useSession, useUserId } from '../../lib/store/session';

interface SubInfo {
  status: string;
  plan: string;
  trial_end: string | null;
}

const formatSubRow = (sub: SubInfo | null): { sub: string; badge?: string } => {
  if (!sub) return { sub: 'Free · all zones via shorts' };
  if (sub.status === 'trialing' && sub.trial_end) {
    const days = Math.max(
      0,
      Math.ceil((new Date(sub.trial_end).getTime() - Date.now()) / (24 * 3600 * 1000)),
    );
    return { sub: `Trial · ${days} day${days === 1 ? '' : 's'} remaining`, badge: 'TRIAL' };
  }
  if (sub.status === 'active') {
    return { sub: `${sub.plan.replace('_', ' ')} · billed automatically`, badge: 'PRO' };
  }
  if (sub.status === 'expired' || sub.status === 'cancelled') {
    return { sub: 'Plan ended — reactivate any time' };
  }
  return { sub: 'Free · all zones via shorts' };
};

interface SwitchRowDef {
  key: string;
  icon: GlyphName;
  tone: HaloTone;
  title: string;
  sub: string;
}
interface NavRowDef {
  key: string;
  icon: GlyphName;
  tone: HaloTone;
  title: string;
  sub: string;
  route?: string;
  accent?: boolean;
  badge?: string;
}

const REMINDERS: ReadonlyArray<SwitchRowDef> = [
  { key: 'nudges',  icon: 'bell',    tone: 'coral',    title: 'Gentle nudges',  sub: 'A handful of reminders a day' },
  { key: 'eye',     icon: 'eye',     tone: 'lavender', title: 'Eye breaks',     sub: 'Every 20 minutes · 20-20-20' },
  { key: 'sound',   icon: 'speaker', tone: 'peach',    title: 'Notification sound', sub: 'Soft tone, never sharp' },
];

const ACCOUNT_TPL: ReadonlyArray<NavRowDef> = [
  { key: 'sub',     icon: 'crown',    tone: 'coral',    title: 'Subscription',    sub: '', route: '/onboarding/paywall' },
  { key: 'profile', icon: 'settings', tone: 'lavender', title: 'Profile details', sub: 'Name, age, pain zones',     route: '/onboarding/quiz/zone' },
  { key: 'restore', icon: 'refresh',  tone: 'mint',     title: 'Restore purchase', sub: 'Re-sync from App Store or Play', route: '/onboarding/paywall' },
];

const PRIVACY: ReadonlyArray<NavRowDef> = [
  { key: 'data',     icon: 'settings', tone: 'lavender', title: 'Data & analytics', sub: 'What we collect and why', route: '/onboarding/permission' },
  { key: 'terms',    icon: 'plus',     tone: 'peach',    title: 'Terms of use',     sub: '',                         route: '/onboarding/permission' },
  { key: 'privacy',  icon: 'plus',     tone: 'peach',    title: 'Privacy policy',   sub: '',                         route: '/onboarding/permission' },
  { key: 'contact',  icon: 'plus',     tone: 'coral',    title: 'Contact support',  sub: 'hi@deskcare.app',          route: '/onboarding/permission' },
  { key: 'signout',  icon: 'close-x',  tone: 'coral',    title: 'Sign out',         sub: '',                         route: '/auth/sign-in', accent: true },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const userId = useUserId();
  const [values, setValues] = useState<Record<string, boolean>>({
    nudges: true,
    eye: true,
    sound: true,
  });
  const [sub, setSub] = useState<SubInfo | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('deskcare_subscriptions')
      .select('status, plan, trial_end')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setSub((data as SubInfo) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const subRow = formatSubRow(sub);
  const ACCOUNT: ReadonlyArray<NavRowDef> = ACCOUNT_TPL.map((r) =>
    r.key === 'sub' ? { ...r, sub: subRow.sub, badge: subRow.badge } : r,
  );

  const toggle = (k: string) => {
    setValues((v) => ({ ...v, [k]: !v[k] }));
  };
  const supabaseSignOut = useSession((s) => s.signOut);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const nav = async (r: NavRowDef) => {
    Haptics.selectionAsync();
    if (r.key === 'signout') {
      await supabaseSignOut();
      router.replace('/auth/sign-in');
      return;
    }
    if (r.route) router.push(r.route as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader title="Settings" onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow>REMINDERS</Eyebrow>
        <View style={styles.group}>
          {REMINDERS.map((r) => (
            <GlassCard key={r.key} tint="cream" radius="xl" padding={spacing.lg}>
              <View style={styles.row}>
                <IconHalo icon={r.icon} size="md" tone={r.tone} variant="tinted" />
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{r.title}</Text>
                  <Text style={styles.rowSub}>{r.sub}</Text>
                </View>
                <ToggleSwitch value={!!values[r.key]} onChange={() => toggle(r.key)} />
              </View>
            </GlassCard>
          ))}
        </View>

        <Eyebrow>ACCOUNT</Eyebrow>
        <View style={styles.group}>
          {ACCOUNT.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => nav(r)}
              accessibilityRole="button"
              accessibilityLabel={r.title}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                <View style={styles.row}>
                  <IconHalo icon={r.icon} size="md" tone={r.tone} variant="tinted" />
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{r.title}</Text>
                    {!!r.sub && <Text style={styles.rowSub}>{r.sub}</Text>}
                  </View>
                  <Chevron />
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>

        <Eyebrow>PRIVACY · SUPPORT</Eyebrow>
        <View style={styles.group}>
          {PRIVACY.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => nav(r)}
              accessibilityRole="button"
              accessibilityLabel={r.title}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GlassCard tint={r.accent ? 'coral' : 'cream'} radius="xl" padding={spacing.lg}>
                <View style={styles.row}>
                  <IconHalo icon={r.icon} size="md" tone={r.tone} variant={r.accent ? 'gradient' : 'tinted'} />
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, r.accent && styles.rowTitleAccent]}>{r.title}</Text>
                    {!!r.sub && <Text style={styles.rowSub}>{r.sub}</Text>}
                  </View>
                  {!r.accent && <Chevron />}
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>

        <Text style={styles.version}>DeskCare v0.1 · Stage 5 design review</Text>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const Chevron = () => (
  <View style={styles.chev}>
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path d="M5 3 L9 7 L5 11" stroke={colors.inkSubtle} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
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
  rowTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  rowTitleAccent: {
    color: colors.primaryDeep,
  },
  rowSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  chev: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  version: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
