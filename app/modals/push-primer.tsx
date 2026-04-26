import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import Svg, { Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  IconHalo,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function PushPrimerScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1.06, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reduceMotion, pulse]);

  const bellStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const enable = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };
  const later = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.18} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View style={styles.heroWrap}>
          <Svg width={200} height={200} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgRadialGradient id="pp-aura" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.6" />
                <Stop offset="0.6" stopColor={colors.primaryMid} stopOpacity="0.2" />
                <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="100" cy="100" r="96" fill="url(#pp-aura)" />
          </Svg>
          <Animated.View style={bellStyle}>
            <IconHalo icon="bell" size="xl" tone="coral" variant="aura" glow />
          </Animated.View>
        </View>

        <View>
          <Eyebrow variant="accent">ONE MORE THING</Eyebrow>
          <Text style={styles.title}>Gentle nudges{'\n'}keep the streak.</Text>
          <Text style={styles.sub}>
            A handful of reminders a day — tuned to your schedule.{'\n'}
            No spam. Silence one tap away.
          </Text>

          <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
            <View style={styles.factRow}>
              <View style={styles.coralDot} />
              <Text style={styles.factText}>4 short nudges between 9 and 18:00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.factRow}>
              <View style={styles.coralDot} />
              <Text style={styles.factText}>20-20-20 eye prompt every 20 minutes</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.factRow}>
              <View style={styles.coralDot} />
              <Text style={styles.factText}>Tweak or silence in Settings, anytime.</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" icon="bell" iconBg breath onPress={enable}>
            Enable reminders
          </PillCTA>
          <Pressable hitSlop={12} onPress={later} style={{ marginTop: spacing.md }}>
            <Text style={styles.laterLink}>Not right now</Text>
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
    justifyContent: 'space-between',
  },
  heroWrap: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: spacing.lg,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  coralDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMid,
  },
  factText: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkHairline,
  },
  ctaBlock: {
    alignItems: 'center',
  },
  laterLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
