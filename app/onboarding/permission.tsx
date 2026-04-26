import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { BgPattern } from '../../components/ui/BgPattern';
import { DecorativeArc } from '../../components/ui/DecorativeArc';
import { IconHalo } from '../../components/ui/IconHalo';
import { GlassCard } from '../../components/ui/GlassCard';
import { PillCTA } from '../../components/ui/PillCTA';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { colors, spacing, typeScale } from '../../constants/tokens';

/**
 * Permission Prompt — the app's first interactive screen after splash.
 * Asks the user to enable reminder notifications. Both CTAs route forward
 * (no dead-end) so the demo flow always advances.
 */
export default function PermissionPromptScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const headOpacity = useSharedValue(0);
  const headY = useSharedValue(14);
  const haloScale = useSharedValue(0.85);
  const haloOpacity = useSharedValue(0);
  const benefitsOpacity = useSharedValue(0);
  const benefitsY = useSharedValue(18);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    const dur = reduceMotion ? 200 : 500;
    haloOpacity.value = withTiming(1, { duration: dur });
    haloScale.value = withTiming(1, { duration: dur + 100, easing: Easing.out(Easing.cubic) });
    headOpacity.value = withDelay(180, withTiming(1, { duration: 420 }));
    headY.value = withDelay(180, withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) }));
    benefitsOpacity.value = withDelay(380, withTiming(1, { duration: 480 }));
    benefitsY.value = withDelay(380, withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(580, withTiming(1, { duration: 420 }));
  }, [reduceMotion, haloOpacity, haloScale, headOpacity, headY, benefitsOpacity, benefitsY, ctaOpacity]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));
  const headStyle = useAnimatedStyle(() => ({
    opacity: headOpacity.value,
    transform: [{ translateY: headY.value }],
  }));
  const benefitsStyle = useAnimatedStyle(() => ({
    opacity: benefitsOpacity.value,
    transform: [{ translateY: benefitsY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const enable = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/settings/notifications');
  };
  const later = () => {
    Haptics.selectionAsync();
    router.push('/settings/notifications');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={280} opacity={0.22} />
      <DecorativeArc position="bottom-left" tone="lavender" size={220} opacity={0.18} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.haloBlock, haloStyle]}>
          <IconHalo icon="bell" size="xl" tone="coral" glow variant="gradient" />
        </Animated.View>

        <Animated.View style={[styles.head, headStyle]}>
          <Eyebrow>REMINDERS</Eyebrow>
          <View style={{ height: spacing.md }} />
          <Text style={styles.title}>Allow gentle{'\n'}nudges</Text>
          <Text style={styles.subtitle}>
            We'll softly remind you when it's time{'\n'}to roll your shoulders or look away.{'\n'}No spam, ever.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.benefits, benefitsStyle]}>
          <GlassCard
            tint="peach"
            radius="xl"
            innerGradient
            decorativeCorner
            padding={spacing.xl}
          >
            <BenefitRow
              icon="clock"
              tone="coral"
              title="Every 2 hours"
              sub="A short 2-minute stretch"
            />
            <Divider />
            <BenefitRow
              icon="eye"
              tone="lavender"
              title="20-20-20 for your eyes"
              sub="A break every 20 minutes"
            />
            <Divider />
            <BenefitRow
              icon="settings"
              tone="mint"
              title="Full control"
              sub="Snooze, tune, turn off"
            />
          </GlassCard>
        </Animated.View>

        <Animated.View style={[styles.ctaBlock, ctaStyle]}>
          <PillCTA
            variant="primary"
            size="lg"
            icon="bell"
            iconBg
            breath
            onPress={enable}
            accessibilityLabel="Turn on reminders"
          >
            Turn on reminders
          </PillCTA>
          <View style={{ height: spacing.md }} />
          <Pressable
            onPress={later}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Not now, set up later"
          >
            <Text style={styles.ghostLink}>Not now</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const BenefitRow: React.FC<{
  icon: Parameters<typeof IconHalo>[0]['icon'];
  tone: 'coral' | 'peach' | 'lavender' | 'mint';
  title: string;
  sub: string;
}> = ({ icon, tone, title, sub }) => (
  <View style={styles.benefitRow}>
    <IconHalo icon={icon} size="md" tone={tone} variant="tinted" glow={false} />
    <View style={styles.benefitText}>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitSub}>{sub}</Text>
    </View>
  </View>
);

const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xxl,
  },
  haloBlock: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  head: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  benefits: {
    marginBottom: spacing.xxxl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  benefitSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkHairline,
    marginVertical: spacing.xs,
  },
  ctaBlock: {
    alignItems: 'center',
  },
  ghostLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
