import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { safeBack } from '../../lib/nav';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  GlassCard,
  IconHalo,
  NavHeader,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useBuddy, createBuddyInvite, acceptBuddyInvite } from '../../hooks/useBuddy';
import { t } from '../../lib/i18n';

const daysSince = (iso: string | null): string => {
  if (!iso) return t('buddy_last_never');
  const d = new Date(iso + 'T00:00:00');
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return t('buddy_last_today');
  if (days === 1) return t('buddy_last_yesterday');
  if (days < 7) return t('buddy_last_days', { n: days });
  return t('buddy_last_weeks', { n: Math.floor(days / 7) });
};

export default function BuddyScreen() {
  const insets = useSafeAreaInsets();
  const { buddy, loading, refresh } = useBuddy();

  // Local UI state for unpaired flow.
  const [mode, setMode] = useState<'overview' | 'invite' | 'enter'>('overview');
  const [code, setCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [busy, setBusy] = useState(false);

  const onInvite = async () => {
    Haptics.selectionAsync();
    setBusy(true);
    const res = await createBuddyInvite();
    setBusy(false);
    if (res) {
      setCode(res.code);
      setMode('invite');
    } else {
      Alert.alert(t('buddy_invite_err_title'), t('buddy_invite_err_body'));
    }
  };
  const onShare = async () => {
    if (!code) return;
    Haptics.selectionAsync();
    await Share.share({
      message: t('buddy_share_message', { code }),
    });
  };
  const onAccept = async () => {
    const clean = enteredCode.trim().toUpperCase();
    if (clean.length !== 6) {
      Alert.alert(t('buddy_validate_title'), t('buddy_validate_body'));
      return;
    }
    setBusy(true);
    const res = await acceptBuddyInvite(clean);
    setBusy(false);
    if ('error' in res) {
      Alert.alert(t('buddy_err_title'), res.error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refresh();
    setMode('overview');
    setEnteredCode('');
    Alert.alert(t('buddy_paired_alert_title'), t('buddy_paired_alert_body', { name: res.display_name }));
  };

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="mint" size={220} opacity={0.18} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <NavHeader showBack onBack={() => safeBack('/main/profile')} title="" />

        <Text style={styles.eyebrow}>{t('buddy_eyebrow')}</Text>
        <Text style={styles.title}>
          {buddy ? t('buddy_title_paired', { name: buddy.display_name }) : t('buddy_title_unpaired')}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.huge, paddingTop: spacing.lg }}
          style={{ flex: 1 }}
        >
          {loading && <Text style={styles.muted}>{t('buddy_loading')}</Text>}

          {!loading && buddy && (
            <Animated.View entering={FadeIn.duration(280)}>
              <GlassCard tint="mint" radius="xl" padding={spacing.xl} innerGradient>
                <Animated.View style={[styles.haloWrap, pulseStyle]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{buddy.display_name.charAt(0).toUpperCase()}</Text>
                  </View>
                </Animated.View>
                <Text style={styles.buddyName}>{buddy.display_name}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statValue}>{buddy.current_streak}</Text>
                    <Text style={styles.statLabel}>{t('buddy_stat_streak')}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={styles.statValue}>{buddy.longest_streak}</Text>
                    <Text style={styles.statLabel}>{t('buddy_stat_best')}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={styles.statValueSm}>{daysSince(buddy.last_activity_date)}</Text>
                    <Text style={styles.statLabel}>{t('buddy_stat_last')}</Text>
                  </View>
                </View>
              </GlassCard>

              <Text style={styles.copy}>{t('buddy_paired_copy')}</Text>
            </Animated.View>
          )}

          {!loading && !buddy && mode === 'overview' && (
            <Animated.View entering={FadeIn.duration(280)}>
              <Pressable
                onPress={onInvite}
                accessibilityRole="button"
                accessibilityLabel={t('buddy_send_invite')}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <GlassCard tint="coral" radius="xl" padding={spacing.lg}>
                  <View style={styles.actionRow}>
                    <IconHalo icon="plus" size="md" tone="coral" variant="tinted" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>{t('buddy_send_invite')}</Text>
                      <Text style={styles.actionSub}>{t('buddy_send_invite_sub')}</Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>

              <Pressable
                onPress={() => setMode('enter')}
                accessibilityRole="button"
                accessibilityLabel={t('buddy_have_code')}
                style={({ pressed }) => [pressed && styles.pressed, { marginTop: spacing.md }]}
              >
                <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                  <View style={styles.actionRow}>
                    <IconHalo icon="check" size="md" tone="mint" variant="tinted" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>{t('buddy_have_code')}</Text>
                      <Text style={styles.actionSub}>{t('buddy_have_code_sub')}</Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>

              <Text style={styles.helperCopy}>{t('buddy_intro_copy')}</Text>
            </Animated.View>
          )}

          {!loading && !buddy && mode === 'invite' && code && (
            <Animated.View entering={FadeIn.duration(360)}>
              <GlassCard tint="coral" radius="xl" padding={spacing.xl}>
                <Text style={styles.codeEyebrow}>{t('buddy_code_eyebrow')}</Text>
                <Text style={styles.codeValue}>{code}</Text>
                <Text style={styles.codeSub}>{t('buddy_code_sub')}</Text>
              </GlassCard>
              <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
                <PillCTA variant="primary" size="lg" onPress={onShare}>
                  {t('buddy_cta_share')}
                </PillCTA>
                <Pressable onPress={() => { setMode('overview'); setCode(null); }} hitSlop={12} style={{ marginTop: spacing.md }}>
                  <Text style={styles.dismissText}>{t('buddy_cta_done')}</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {!loading && !buddy && mode === 'enter' && (
            <Animated.View entering={FadeIn.duration(280)}>
              <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                <Text style={styles.codeEyebrow}>{t('buddy_enter_eyebrow')}</Text>
                <TextInput
                  value={enteredCode}
                  onChangeText={(tx) => setEnteredCode(tx.toUpperCase())}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                  placeholder="ABC123"
                  placeholderTextColor={colors.inkSubtle}
                  style={styles.codeInput}
                />
              </GlassCard>
              <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
                <PillCTA variant="primary" size="lg" onPress={onAccept} disabled={busy || enteredCode.length !== 6}>
                  {t('buddy_cta_pair')}
                </PillCTA>
                <Pressable onPress={() => setMode('overview')} hitSlop={12} style={{ marginTop: spacing.md }}>
                  <Text style={styles.dismissText}>{t('buddy_cta_back')}</Text>
                </Pressable>
              </View>
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
  pressed: {
    opacity: 0.85,
  },
  muted: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    textAlign: 'center',
    paddingVertical: spacing.huge,
  },
  haloWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typeScale.headline,
    color: colors.surfaceCard,
  },
  buddyName: {
    ...typeScale.titleLg,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
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
    ...typeScale.headlineSm,
    color: colors.ink,
  },
  statValueSm: {
    ...typeScale.titleLg,
    color: colors.ink,
    textAlign: 'center',
  },
  statLabel: {
    ...typeScale.label,
    color: colors.inkSubtle,
    marginTop: 2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: colors.inkHairline,
  },
  copy: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.lg,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  actionSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  helperCopy: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  codeEyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  codeValue: {
    ...typeScale.displayXl,
    fontSize: 56,
    lineHeight: 60,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 8,
  },
  codeSub: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  codeInput: {
    ...typeScale.headlineSm,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 6,
    paddingVertical: spacing.md,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  dismissText: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
  },
});
