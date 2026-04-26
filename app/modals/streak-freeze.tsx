import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, Path, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  Eyebrow,
  GlassCard,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function StreakFreezeScreen() {
  const insets = useSafeAreaInsets();

  const use = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (router.canGoBack()) router.back();
  };
  const skip = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View style={styles.heroWrap}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Defs>
              <SvgRadialGradient id="sf-aura" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.tertiaryMid} stopOpacity="0.45" />
                <Stop offset="0.6" stopColor={colors.primaryMid} stopOpacity="0.22" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="100" cy="100" r="96" fill="url(#sf-aura)" />
            {/* Snowflake-ish coral icon */}
            <Path d="M100 50 L100 150 M50 100 L150 100 M62 62 L138 138 M138 62 L62 138" stroke={colors.primaryMid} strokeWidth="5" strokeLinecap="round" />
            <Circle cx="100" cy="100" r="14" fill={colors.primaryMid} />
            <Circle cx="100" cy="100" r="6" fill={colors.white} />
          </Svg>
        </View>

        <View>
          <Eyebrow variant="accent">MISSED YESTERDAY?</Eyebrow>
          <Text style={styles.title}>Protect your{'\n'}6-day streak.</Text>
          <Text style={styles.sub}>
            Use a freeze to pause one day without breaking the streak.{'\n'}
            You have 2 freezes left this month.
          </Text>

          <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
            <View style={styles.infoRow}>
              <View style={styles.dotCoral} />
              <Text style={styles.infoText}>Your streak stays 6 days.</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.dotCoral} />
              <Text style={styles.infoText}>Tomorrow picks up where you left off.</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.dotMuted} />
              <Text style={styles.infoMuted}>Freezes reset on the 1st of next month.</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" breath onPress={use}>
            Use a freeze
          </PillCTA>
          <Pressable hitSlop={12} onPress={skip} style={{ marginTop: spacing.md }}>
            <Text style={styles.skipLink}>Let it reset</Text>
          </Pressable>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroWrap: {
    alignItems: 'center',
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dotCoral: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMid,
  },
  dotMuted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryDim,
  },
  infoText: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  infoMuted: {
    ...typeScale.body,
    color: colors.inkMuted,
    flex: 1,
    minWidth: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkHairline,
  },
  ctaBlock: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  skipLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
