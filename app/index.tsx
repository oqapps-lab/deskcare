import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { colors, spacing, typeScale } from '../constants/tokens';

/**
 * Splash screen — animated brand mark → auto-routes to the onboarding flow
 * after ~1.8s. Entry point of the demo experience. No debug UI.
 */
export default function Splash() {
  const reduceMotion = useReducedMotion();
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const haloOpacity = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(10);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    const dur = reduceMotion ? 200 : 600;
    logoScale.value = withTiming(1, { duration: dur, easing: Easing.out(Easing.cubic) });
    logoOpacity.value = withTiming(1, { duration: dur });
    haloOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    wordOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    wordY.value = withDelay(500, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(850, withTiming(1, { duration: 500 }));

    const t = setTimeout(() => {
      router.replace('/onboarding/permission');
    }, reduceMotion ? 900 : 1900);
    return () => clearTimeout(t);
  }, [reduceMotion, logoScale, logoOpacity, haloOpacity, wordOpacity, wordY, taglineOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: haloOpacity.value }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <AtmosphericBackground>
      <View style={styles.root}>
        {/* Halo behind logo */}
        <Animated.View style={[styles.haloWrap, haloStyle]} pointerEvents="none">
          <Svg width={320} height={320} viewBox="0 0 320 320">
            <Defs>
              <SvgLinearGradient id="halo" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.55" />
                <Stop offset="0.5" stopColor={colors.primary} stopOpacity="0.22" />
                <Stop offset="1" stopColor={colors.secondary} stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>
            <Circle cx="160" cy="160" r="140" fill="url(#halo)" />
          </Svg>
        </Animated.View>

        {/* Animated logo — DeskCare brand glyph: stylized "D" as a leaf-like curve */}
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Svg width={96} height={96} viewBox="0 0 96 96">
            <Defs>
              <SvgLinearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
                <Stop offset="0.5" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primaryDeep} stopOpacity="1" />
              </SvgLinearGradient>
              <SvgLinearGradient id="logoGlow" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.6" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>
            {/* Outer soft circle */}
            <Circle cx="48" cy="48" r="44" fill="url(#logo)" />
            {/* Inner highlight — glossy top */}
            <Path
              d="M14 36 Q48 6 82 36 Q82 32 48 12 Q14 32 14 36 Z"
              fill="url(#logoGlow)"
            />
            {/* Leaf stroke — the "stretch" gesture */}
            <Path
              d="M32 62 Q48 34 64 62"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="48" cy="56" r="3.5" fill="#FFFFFF" />
          </Svg>
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
        <Animated.Text style={[styles.wordmark, wordStyle]}>DeskCare</Animated.Text>
        <View style={{ height: spacing.sm }} />
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Micro-stretches at your desk
        </Animated.Text>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloWrap: {
    position: 'absolute',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    ...typeScale.display,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
