import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function RateAppScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);

  const pick = (n: number) => {
    Haptics.selectionAsync();
    setRating(n);
  };

  const submit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
      ? 'Pick a rating — we read every one.'
      : rating >= 4
      ? 'Lovely — would you leave this on the App Store?'
      : 'Fair enough. What could be gentler?';

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View>
          <Eyebrow variant="accent">QUICK FAVOR</Eyebrow>
          <Text style={styles.title}>How are we doing?</Text>
          <Text style={styles.sub}>
            A few taps — it shapes what we build next. No popups, we promise.
          </Text>

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
            {rating === 0 ? 'Maybe later' : rating >= 4 ? 'Rate on the App Store' : 'Send feedback'}
          </PillCTA>
          {rating > 0 && (
            <Pressable hitSlop={12} onPress={later} style={{ marginTop: spacing.md }}>
              <Text style={styles.laterLink}>Later</Text>
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
