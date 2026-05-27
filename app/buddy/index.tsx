import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
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

const daysSince = (iso: string | null): string => {
  if (!iso) return 'never';
  const d = new Date(iso + 'T00:00:00');
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
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
      Alert.alert('Could not generate code', 'Please try again in a moment.');
    }
  };
  const onShare = async () => {
    if (!code) return;
    Haptics.selectionAsync();
    await Share.share({
      message: `Join me on DeskCare. Use my invite code: ${code}\n\nDownload: https://apps.apple.com/app/deskcare`,
    });
  };
  const onAccept = async () => {
    const clean = enteredCode.trim().toUpperCase();
    if (clean.length !== 6) {
      Alert.alert('Six characters', 'Invite codes are 6 letters/numbers.');
      return;
    }
    setBusy(true);
    const res = await acceptBuddyInvite(clean);
    setBusy(false);
    if ('error' in res) {
      Alert.alert('Could not pair', res.error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refresh();
    setMode('overview');
    setEnteredCode('');
    Alert.alert("You're paired", `Paired with ${res.display_name}.`);
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
        <NavHeader showBack onBack={() => router.back()} title="" />

        <Text style={styles.eyebrow}>BUDDY</Text>
        <Text style={styles.title}>
          {buddy ? `You + ${buddy.display_name}` : 'Find a stretching buddy'}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.huge, paddingTop: spacing.lg }}
          style={{ flex: 1 }}
        >
          {loading && <Text style={styles.muted}>Loading…</Text>}

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
                    <Text style={styles.statLabel}>STREAK</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={styles.statValue}>{buddy.longest_streak}</Text>
                    <Text style={styles.statLabel}>BEST</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={styles.statValueSm}>{daysSince(buddy.last_activity_date)}</Text>
                    <Text style={styles.statLabel}>LAST</Text>
                  </View>
                </View>
              </GlassCard>

              <Text style={styles.copy}>
                You can see each other's streak — no leaderboard, no comparing, just gentle accountability.
                When they fall off, that's your nudge to text them.
              </Text>
            </Animated.View>
          )}

          {!loading && !buddy && mode === 'overview' && (
            <Animated.View entering={FadeIn.duration(280)}>
              <Pressable onPress={onInvite} style={({ pressed }) => [pressed && styles.pressed]}>
                <GlassCard tint="coral" radius="xl" padding={spacing.lg}>
                  <View style={styles.actionRow}>
                    <IconHalo icon="plus" size="md" tone="coral" variant="tinted" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>Send an invite</Text>
                      <Text style={styles.actionSub}>You get a 6-character code to share</Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>

              <Pressable onPress={() => setMode('enter')} style={({ pressed }) => [pressed && styles.pressed, { marginTop: spacing.md }]}>
                <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                  <View style={styles.actionRow}>
                    <IconHalo icon="check" size="md" tone="mint" variant="tinted" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>I have a code</Text>
                      <Text style={styles.actionSub}>Enter the 6-character code from your buddy</Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>

              <Text style={styles.helperCopy}>
                People with a stretching buddy retain 2x longer. No leaderboard, no shame — just the quiet motivation of someone else doing it too.
              </Text>
            </Animated.View>
          )}

          {!loading && !buddy && mode === 'invite' && code && (
            <Animated.View entering={FadeIn.duration(360)}>
              <GlassCard tint="coral" radius="xl" padding={spacing.xl}>
                <Text style={styles.codeEyebrow}>YOUR INVITE CODE</Text>
                <Text style={styles.codeValue}>{code}</Text>
                <Text style={styles.codeSub}>Valid for 7 days. Share it with one person.</Text>
              </GlassCard>
              <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
                <PillCTA variant="primary" size="lg" onPress={onShare}>
                  Share code
                </PillCTA>
                <Pressable onPress={() => { setMode('overview'); setCode(null); }} hitSlop={12} style={{ marginTop: spacing.md }}>
                  <Text style={styles.dismissText}>Done</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {!loading && !buddy && mode === 'enter' && (
            <Animated.View entering={FadeIn.duration(280)}>
              <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                <Text style={styles.codeEyebrow}>ENTER CODE</Text>
                <TextInput
                  value={enteredCode}
                  onChangeText={(t) => setEnteredCode(t.toUpperCase())}
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
                  Pair with my buddy
                </PillCTA>
                <Pressable onPress={() => setMode('overview')} hitSlop={12} style={{ marginTop: spacing.md }}>
                  <Text style={styles.dismissText}>Back</Text>
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
