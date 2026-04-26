import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { BgPattern } from '../../components/ui/BgPattern';
import { DecorativeArc } from '../../components/ui/DecorativeArc';
import { NavHeader } from '../../components/ui/NavHeader';
import { HeroNumber } from '../../components/ui/HeroNumber';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { PillCTA } from '../../components/ui/PillCTA';
import { IconHalo } from '../../components/ui/IconHalo';
import { colors, spacing, typeScale } from '../../constants/tokens';

/**
 * 30-Second Eye Break — intro screen to the 20-20-20 rule exercise.
 * Primary CTA launches the Eye Session screen which runs the timer.
 */
export default function EyeBreakScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const heroOpacity = useSharedValue(0);
  const heroScale = useSharedValue(0.9);
  const infoOpacity = useSharedValue(0);
  const infoY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);
  const halo = useSharedValue(0.55);

  useEffect(() => {
    const dur = reduceMotion ? 200 : 480;
    heroOpacity.value = withTiming(1, { duration: dur });
    heroScale.value = withTiming(1, { duration: dur + 80, easing: Easing.out(Easing.cubic) });
    infoOpacity.value = withDelay(260, withTiming(1, { duration: 420 }));
    infoY.value = withDelay(260, withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(480, withTiming(1, { duration: 400 }));

    if (!reduceMotion) {
      halo.value = withRepeat(
        withTiming(0.85, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
  }, [reduceMotion, heroOpacity, heroScale, infoOpacity, infoY, ctaOpacity, halo]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ scale: heroScale.value }],
  }));
  const infoStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
    transform: [{ translateY: infoY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: halo.value }));

  const start = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/eye/session');
  };
  const skip = () => {
    Haptics.selectionAsync();
    router.push('/eye/session');
  };
  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.08} tone="coral" />
      <DecorativeArc position="top-left" tone="peach" size={260} opacity={0.24} />
      <DecorativeArc position="bottom-right" tone="lavender" size={200} opacity={0.16} />

      <NavHeader onBack={back} />

      <View
        style={[
          styles.root,
          { paddingBottom: insets.bottom + spacing.huge },
        ]}
      >
        <Animated.View style={[styles.heroWrap, heroStyle]}>
          <View style={styles.eyebrowRow}>
            <Eyebrow variant="onPeach">EYE BREAK</Eyebrow>
          </View>
          <View style={{ height: spacing.md }} />
          <Animated.View style={haloStyle}>
            <HeroNumber ghost halo size="xl">
              30
            </HeroNumber>
          </Animated.View>
          <View style={{ marginTop: -spacing.md }}>
            <Eyebrow variant="accent" size="md">
              SECONDS
            </Eyebrow>
          </View>
        </Animated.View>

        <Animated.View style={[styles.infoCluster, infoStyle]}>
          <Text style={styles.title}>Rest{'\n'}your eyes</Text>
          <Text style={styles.subtitle}>
            Look at a point 20 ft away —{'\n'}let your eye muscles relax
          </Text>
          <View style={{ height: spacing.lg }} />
          <View style={styles.ruleRow}>
            <IconHalo
              icon="infinity"
              size="sm"
              tone="lavender"
              variant="tinted"
              glow={false}
            />
            <Text style={styles.ruleInline}>
              20 min · 20 sec · 20 ft
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.ctaCluster, ctaStyle]}>
          <PillCTA
            variant="primary"
            size="lg"
            icon="play"
            iconBg
            breath
            onPress={start}
          >
            Start break
          </PillCTA>
          <View style={{ height: spacing.md }} />
          <Pressable
            onPress={skip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip break"
          >
            <Text style={styles.ghostLink}>Skip</Text>
          </Pressable>
        </Animated.View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  eyebrowRow: {
    alignItems: 'center',
  },
  infoCluster: {
    alignItems: 'center',
    marginVertical: spacing.xl,
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
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ruleInline: {
    ...typeScale.label,
    color: colors.primaryDeep,
    letterSpacing: 1.2,
  },
  ctaCluster: {
    alignItems: 'center',
  },
  ghostLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
