import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../lib/store/session';

const CONFIRM_PHRASE = 'DELETE';

export default function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const supabaseSignOut = useSession((s) => s.signOut);
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  const canSubmit = confirm.trim().toUpperCase() === CONFIRM_PHRASE && !loading;

  const submit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Delete account?',
      "This permanently deletes your profile, streak, pain history, sessions, and subscription state. This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError(null);
            const { error } = await supabase.rpc('delete_account');
            if (error) {
              setError(error.message);
              setLoading(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              return;
            }
            // RPC succeeded — supabase still holds the JWT locally; sign out
            // to clear AsyncStorage + listeners, then route to welcome.
            await supabaseSignOut();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/onboarding/welcome');
          },
        },
      ],
    );
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader title="Delete account" onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow variant="accent">PERMANENT</Eyebrow>
        <Text style={styles.title}>This deletes{'\n'}everything.</Text>
        <Text style={styles.body}>
          You're about to permanently remove:
        </Text>

        <GlassCard tint="cream" radius="xl" padding={spacing.lg} style={{ marginVertical: spacing.lg }}>
          <Bullet>Your profile and onboarding answers</Bullet>
          <Bullet>Streak, sessions, total minutes</Bullet>
          <Bullet>Pain history (all 14-day check-ins)</Bullet>
          <Bullet>Subscription state in our database</Bullet>
          <Bullet>Notification reminders</Bullet>
        </GlassCard>

        <Text style={styles.body}>
          Apple's billing isn't affected — if you have an active subscription, manage or cancel it in Settings → Apple ID → Subscriptions. We can't cancel it for you.
        </Text>

        <View style={{ height: spacing.lg }} />

        <Eyebrow>CONFIRM</Eyebrow>
        <Text style={styles.confirmHint}>
          Type <Text style={styles.confirmPhrase}>{CONFIRM_PHRASE}</Text> to enable the button.
        </Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder={CONFIRM_PHRASE}
          placeholderTextColor={colors.inkSubtle}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={{ height: spacing.xl }} />

        <PillCTA
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          loading={loading}
          onPress={submit}
        >
          Delete forever
        </PillCTA>

        <View style={{ height: spacing.md }} />

        <PillCTA variant="ghost" size="md" onPress={back}>
          Cancel
        </PillCTA>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  body: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryMid,
    marginTop: 8,
  },
  bulletText: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
  },
  confirmHint: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  confirmPhrase: {
    ...typeScale.titleLg,
    color: colors.primaryDeep,
  },
  input: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    ...typeScale.titleLg,
    color: colors.ink,
    letterSpacing: 1,
  },
  error: {
    ...typeScale.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
