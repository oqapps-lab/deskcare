import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Stop,
} from 'react-native-svg';
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

export default function ForceUpdateScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, pulse]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const update = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // In production, open App Store — for Stage 5 just return to demo
    router.replace('/main/home');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.18} />
      <DecorativeArc position="bottom-left" tone="lavender" size={200} opacity={0.14} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <Animated.View style={[styles.iconWrap, iconStyle]}>
          {/* Soft warm radial glow + bold gradient up-arrow — matches the
              `aura` aesthetic across all hero stamps so nothing reads like
              a pasted-on coral disk. */}
          <Svg width={160} height={160} viewBox="0 0 160 160">
            <Defs>
              <SvgRadialGradient id="fu-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.85" />
                <Stop offset="0.45" stopColor={colors.primaryMid} stopOpacity="0.4" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
              </SvgRadialGradient>
              <SvgLinearGradient id="fu-arrow" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.primaryDeep} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primaryMid} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Circle cx="80" cy="80" r="72" fill="url(#fu-glow)" />
            <Path
              d="M80 56 L80 110 M58 78 L80 56 L102 78"
              stroke="url(#fu-arrow)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>

        <View>
          <Eyebrow variant="accent">UPDATE REQUIRED</Eyebrow>
          <Text style={styles.title}>Please update{'\n'}to continue.</Text>
          <Text style={styles.sub}>
            We've shipped some quiet improvements to keep your streak and
            pain data safe. It's a quick one.
          </Text>

          <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
            <Text style={styles.whatsNewTitle}>In this update</Text>
            <View style={styles.line}>
              <View style={styles.dot} />
              <Text style={styles.lineText}>Faster session loading</Text>
            </View>
            <View style={styles.line}>
              <View style={styles.dot} />
              <Text style={styles.lineText}>Two new eye routines</Text>
            </View>
            <View style={styles.line}>
              <View style={styles.dot} />
              <Text style={styles.lineText}>Reliability fixes for Sciatica check-in</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" breath onPress={update}>
            Update in App Store
          </PillCTA>
          <Text style={styles.versionText}>You are on DeskCare 0.1 · Required 0.2+</Text>
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
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  whatsNewTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryMid,
  },
  lineText: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  ctaBlock: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  versionText: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
