import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SUPPORT_EMAIL } from '../../lib/legal';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { t } from '../../lib/i18n';

export default function RateAppScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);

  const pick = (n: number) => {
    Haptics.selectionAsync();
    setRating(n);
  };

  const submit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // High rating → App Store write-review deep link. Low rating → mailto
    // so user feedback lands somewhere actionable instead of evaporating.
    // Previous behaviour: submit only closed the modal without recording
    // the rating anywhere, so the user thought they had rated but no signal
    // reached the App Store and no feedback reached the team.
    if (rating >= 4) {
      Linking.openURL(
        'https://apps.apple.com/app/id6767548896?action=write-review',
      ).catch(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      });
    } else if (rating > 0) {
      const subject = encodeURIComponent('DeskCare feedback (' + rating + '/5)');
      const body = encodeURIComponent(
        'Hi DeskCare team,

My rating: ' + rating + '/5.

What could be better:
',
      );
      Linking.openURL('mailto:' + SUPPORT_EMAIL + '?subject=' + subject + '&body=' + body).catch(
        () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      );
    }
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };
  const later = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  const prompt =
    rating === 0
      ? t('rate_prompt_zero')
      : rating >= 4
      ? t('rate_prompt_high')
      : t('rate_prompt_low');

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View>
          <Eyebrow variant="accent">{t('rate_eb_quick_favor')}</Eyebrow>
          <Text style={styles.title}>{t('rate_title')}</Text>
          <Text style={styles.sub}>{t('rate_app_sub_explainer')}</Text>

          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => pick(n)}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} stars`}
                  accessibilityState={{ selected: rating >= n }}
                >
                  <Star filled={rating >= n} />
                </Pressable>
              ))}
            </View>
            <Text style={styles.prompt}>{prompt}</Text>
          </GlassCard>
        </View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" breath={rating > 0} onPress={submit}>
            {rating === 0 ? t('rate_app_cta_maybe_later') : rating >= 4 ? t('rate_app_cta_rate') : t('rate_app_cta_feedback')}
          </PillCTA>
          {rating > 0 && (
            <Pressable hitSlop={12} onPress={later} style={{ marginTop: spacing.md }}>
              <Text style={styles.laterLink}>{t('rate_later')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const Star: React.FC<{ filled: boolean }> = ({ filled }) => (
  <Svg width={44} height={44} viewBox="0 0 24 24">
    <Path
      d="M12 2 L15 9 L22 9.8 L16.8 14.6 L18.4 22 L12 18.2 L5.6 22 L7.2 14.6 L2 9.8 L9 9 Z"
      fill={filled ? colors.primaryMid : 'none'}
      stroke={filled ? colors.primaryMid : colors.primaryMid}
      strokeWidth="2"
      opacity={filled ? 1 : 0.55}
      strokeLinejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  prompt: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  ctaBlock: {
    alignItems: 'center',
  },
  laterLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
