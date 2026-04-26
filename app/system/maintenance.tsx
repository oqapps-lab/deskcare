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
  RadialGradient as SvgRadialGradient,
  Stop,
  Path,
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

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const breath = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    breath.value = withRepeat(
      withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, breath]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: breath.value }] }));

  const retry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/main/home');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="lavender" size={240} opacity={0.18} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <Animated.View style={[styles.iconWrap, iconStyle]}>
          <Svg width={180} height={180} viewBox="0 0 180 180">
            <Defs>
              <SvgRadialGradient id="mt-aura" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.55" />
                <Stop offset="0.6" stopColor={colors.primaryMid} stopOpacity="0.18" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="90" cy="90" r="86" fill="url(#mt-aura)" />

            {/* Hands of a clock hinting at "just a moment" */}
            <Circle cx="90" cy="90" r="54" fill={colors.surfaceCard} />
            <Circle cx="90" cy="90" r="54" stroke={colors.primarySoft} strokeWidth="2" fill="none" />
            <Path d="M90 54 L90 90 L116 104" stroke={colors.primaryMid} strokeWidth="4" strokeLinecap="round" fill="none" />
            <Circle cx="90" cy="90" r="4" fill={colors.primary} />
          </Svg>
        </Animated.View>

        <View>
          <Eyebrow variant="accent">WE'LL BE RIGHT BACK</Eyebrow>
          <Text style={styles.title}>Caring for the{'\n'}servers for a minute.</Text>
          <Text style={styles.sub}>
            Nothing urgent — a quick update to keep things quiet and
            private. Back shortly.
          </Text>

          <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
            <View style={styles.row}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>Your streak and plan are safe on your device.</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>Eye break timer still works offline.</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.dotMuted} />
              <Text style={styles.rowMuted}>Status: Expected back in ~10 minutes.</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" icon="refresh" onPress={retry}>
            Try again
          </PillCTA>
          <Text style={styles.statusLink}>status.deskcare.app</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dot: {
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
  rowText: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  rowMuted: {
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
  statusLink: {
    ...typeScale.bodySm,
    color: colors.primaryMid,
    marginTop: spacing.md,
  },
});
