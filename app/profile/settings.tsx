import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LEGAL_URLS, SUPPORT_EMAIL } from '../../lib/legal';
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
import { t } from '../../lib/i18n';

interface SubInfo {
  status: string;
  plan: string;
  trial_end: string | null;
}

const formatSubRow = (sub: SubInfo | null): { sub: string; badge?: string } => {
  if (!sub) return { sub: t('ps_subscription_sub_free') };
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
    return { sub: t('ps_subscription_sub_expired') };
  }
  return { sub: t('ps_subscription_sub_free') };
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
  /** Internal expo-router path (mutually exclusive with `url`). */
  route?: string;
  /** External URL — opened via Linking. */
  url?: string;
  accent?: boolean;
  badge?: string;
}

const REMINDERS: ReadonlyArray<SwitchRowDef> = [
  { key: 'nudges',  icon: 'bell',    tone: 'coral',    title: t('ps_gentle_title'),       sub: t('ps_gentle_sub') },
  { key: 'eye',     icon: 'eye',     tone: 'lavender', title: t('ps_eyebreaks_title'),    sub: t('ps_eyebreaks_sub') },
  { key: 'sound',   icon: 'speaker', tone: 'peach',    title: t('ps_notif_sound_title'),  sub: t('ps_notif_sound_sub') },
];

const ACCOUNT_TPL: ReadonlyArray<NavRowDef> = [
  { key: 'sub',     icon: 'crown',    tone: 'coral',    title: t('ps_subscription_title'),    sub: '', route: '/onboarding/paywall' },
  { key: 'restore', icon: 'refresh',  tone: 'mint',     title: t('ps_restore_title'),         sub: t('ps_restore_sub'), route: '/onboarding/paywall' },
];

const PRIVACY: ReadonlyArray<NavRowDef> = [
  { key: 'data',     icon: 'settings', tone: 'lavender', title: t('ps_data_title'),    sub: t('ps_data_sub'),    url: LEGAL_URLS.privacy },
  { key: 'terms',    icon: 'plus',     tone: 'peach',    title: t('common_terms_of_use'),     sub: '',                         url: LEGAL_URLS.terms },
  { key: 'privacy',  icon: 'plus',     tone: 'peach',    title: t('common_privacy_policy'),   sub: '',                         url: LEGAL_URLS.privacy },
  { key: 'contact',  icon: 'plus',     tone: 'coral',    title: t('ps_contact_title'),  sub: SUPPORT_EMAIL,              url: `mailto:${SUPPORT_EMAIL}` },
  { key: 'delete',   icon: 'close-x',  tone: 'coral',    title: t('ps_delete_title'),   sub: t('ps_delete_sub'), route: '/profile/delete-account' },
  { key: 'signout',  icon: 'close-x',  tone: 'coral',    title: t('ps_signout'),        sub: '',                         route: '/auth/sign-in', accent: true },
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
    else router.replace('/main/profile');
  };
  const nav = async (r: NavRowDef) => {
    Haptics.selectionAsync();
    if (r.key === 'signout') {
      await supabaseSignOut();
      router.replace('/auth/sign-in');
      return;
    }
    if (r.url) {
      Linking.openURL(r.url).catch(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      });
      return;
    }
    if (r.route) router.push(r.route as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader title={t('prof_settings')} onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow>{t('ps_reminders_eyebrow')}</Eyebrow>
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

        <Eyebrow>{t('ps_account_eyebrow')}</Eyebrow>
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

        <Eyebrow>{t('ps_privacy_support_eyebrow')}</Eyebrow>
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

        <Text style={styles.version}>{t('ps_version')}</Text>
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
