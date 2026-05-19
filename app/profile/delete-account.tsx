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
import { t } from '../../lib/i18n';

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
    else router.replace('/main/profile');
  };

  const canSubmit = confirm.trim().toUpperCase() === CONFIRM_PHRASE && !loading;

  const submit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      t('delete_account_alert_title'),
      t('delete_account_alert_body'),
      [
        { text: t('common_cancel'), style: 'cancel' },
        {
          text: t('common_delete_forever'),
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

      <NavHeader title={t('ps_delete_title')} onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow variant="accent">{t('delete_eb_permanent')}</Eyebrow>
        <Text style={styles.title}>{t('pd_title')}</Text>
        <Text style={styles.body}>
          {t('pd_body')}
        </Text>

        <GlassCard tint="cream" radius="xl" padding={spacing.lg} style={{ marginVertical: spacing.lg }}>
          <Bullet>{t('pd_bullet_profile')}</Bullet>
          <Bullet>{t('pd_bullet_streak')}</Bullet>
          <Bullet>{t('pd_bullet_pain')}</Bullet>
          <Bullet>{t('pd_bullet_subscription')}</Bullet>
          <Bullet>{t('pd_bullet_notif')}</Bullet>
        </GlassCard>

        <Text style={styles.body}>
          {t('pd_apple_notice')}
        </Text>

        <View style={{ height: spacing.lg }} />

        <Eyebrow>{t('delete_eb_confirm')}</Eyebrow>
        <Text style={styles.confirmHint}>
          {t('pd_confirm_hint_prefix')}{' '}
          <Text style={styles.confirmPhrase}>{CONFIRM_PHRASE}</Text>{' '}
          {t('pd_confirm_hint_suffix')}
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
          {t('pd_cta_delete')}
        </PillCTA>

        <View style={{ height: spacing.md }} />

        <PillCTA variant="ghost" size="md" onPress={back}>
          {t('common_cancel')}
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
