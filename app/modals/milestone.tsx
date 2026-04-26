import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  useReducedMotion,
  withDelay,
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
  Eyebrow,
  GlassCard,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function MilestoneScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);

  useEffect(() => {
    scale.value = withTiming(1, { duration: reduceMotion ? 200 : 540, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 400 });
    contentOpacity.value = withDelay(reduceMotion ? 0 : 280, withTiming(1, { duration: 540 }));
    contentY.value = withDelay(reduceMotion ? 0 : 280, withTiming(0, { duration: 560, easing: Easing.out(Easing.cubic) }));

    if (!reduceMotion) {
      pulse.value = withRepeat(
        withTiming(1.05, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
  }, [reduceMotion, scale, opacity, pulse, contentOpacity, contentY]);

  const medalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pulse.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const share = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/modals/share');
  };
  const close = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        {/* Soft warm halo + bold gradient number — no flat coral disk. The
            number sits inside an elegant aura instead of being stamped onto
            a kindergarten badge. */}
        <Animated.View style={[styles.medalWrap, medalStyle]}>
          <Svg width={220} height={220} viewBox="0 0 220 220">
            <Defs>
              <SvgRadialGradient id="ms-burst" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.95" />
                <Stop offset="0.45" stopColor={colors.primaryMid} stopOpacity="0.45" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="110" cy="110" r="104" fill="url(#ms-burst)" />
          </Svg>
          <View style={styles.numberOverlay} pointerEvents="none">
            <Text style={styles.bigNumber}>7</Text>
            <Text style={styles.daysLabel}>DAYS</Text>
          </View>
        </Animated.View>

        <Animated.View style={contentStyle}>
          <Eyebrow variant="accent">MILESTONE UNLOCKED</Eyebrow>
          <Text style={styles.title}>A week of small{'\n'}releases.</Text>
          <Text style={styles.sub}>
            You've spent 14 minutes this week undoing desk tension.{'\n'}
            That's exactly how habits start.
          </Text>

          <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient decorativeCorner>
            <View style={styles.factsRow}>
              <Fact v="7"  l="DAYS" />
              <Sep />
              <Fact v="14" l="MINUTES" />
              <Sep />
              <Fact v="21" l="MOVES" />
            </View>
          </GlassCard>
        </Animated.View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" breath onPress={share}>
            Share this
          </PillCTA>
          <Pressable hitSlop={12} onPress={close} style={{ marginTop: spacing.md }}>
            <Text style={styles.closeLink}>Back to home</Text>
          </Pressable>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const Fact: React.FC<{ v: string; l: string }> = ({ v, l }) => (
  <View style={styles.factCol}>
    <Text style={styles.factValue}>{v}</Text>
    <Text style={styles.factLabel}>{l}</Text>
  </View>
);
const Sep = () => <View style={styles.factSep} />;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medalWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 88,
    lineHeight: 92,
    color: colors.primaryDeep,
    fontFamily: typeScale.display.fontFamily,
    letterSpacing: -2,
  },
  daysLabel: {
    ...typeScale.label,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 2,
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
  factsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factCol: {
    flex: 1,
    alignItems: 'center',
  },
  factValue: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
    letterSpacing: -0.5,
  },
  factLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  factSep: {
    width: 1,
    height: 24,
    backgroundColor: colors.inkHairline,
  },
  ctaBlock: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  closeLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
