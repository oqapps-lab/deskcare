import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { PulseRings } from '../components/ui/PulseRings';
import { Eyebrow } from '../components/ui/Eyebrow';
import { colors, spacing, typeScale } from '../constants/tokens';

/**
 * Loading / sync screen. Shown briefly between Pain Check-in and the next step.
 * Auto-advances after ~2.2s to the no-connection state (demo flow) — simulates
 * a real sync that occasionally fails and offers offline mode.
 */
export default function SyncScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(12);
  const auraScale = useSharedValue(0.9);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 400 });
    contentY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

    if (!reduceMotion) {
      auraScale.value = withRepeat(
        withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }

    const t = setTimeout(() => {
      router.replace('/errors/no-connection');
    }, reduceMotion ? 1400 : 2400);
    return () => clearTimeout(t);
  }, [contentOpacity, contentY, auraScale, reduceMotion]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const auraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraScale.value }],
  }));

  return (
    <AtmosphericBackground>
      <Animated.View
        style={[
          styles.root,
          contentStyle,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
      >
        <View style={styles.stackTop}>
          <Eyebrow>PLEASE WAIT</Eyebrow>
        </View>

        <View style={styles.ringsCluster}>
          {/* Aura backdrop — soft radial coral */}
          <Animated.View style={[styles.auraWrap, auraStyle]} pointerEvents="none">
            <Svg width={320} height={320} viewBox="0 0 320 320">
              <Defs>
                <SvgRadialGradient id="aura" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.55" />
                  <Stop offset="0.5" stopColor={colors.primaryMid} stopOpacity="0.22" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </SvgRadialGradient>
              </Defs>
              <Circle cx="160" cy="160" r="150" fill="url(#aura)" />
            </Svg>
          </Animated.View>
          <PulseRings size={260} rings={4} />
        </View>

        <View style={styles.stackBottom}>
          <Text style={styles.title}>Syncing{'\n'}your data</Text>
          <Text style={styles.subtitle}>
            Saving your stretch progress and{'\n'}reminder preferences
          </Text>
        </View>
      </Animated.View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
  },
  stackTop: {
    alignItems: 'center',
  },
  ringsCluster: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auraWrap: {
    position: 'absolute',
    width: 320,
    height: 320,
  },
  stackBottom: {
    alignItems: 'center',
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
});
