import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Image } from 'expo-image';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { colors, spacing, typeScale } from '../constants/tokens';
import { useSession } from '../lib/store/session';
import { supabase } from '../lib/supabase';
import { t } from '../lib/i18n';

/**
 * Splash screen — animated brand mark → auto-routes to the onboarding flow
 * after ~1.8s. Entry point of the demo experience. No debug UI.
 */
export default function Splash() {
  const reduceMotion = useReducedMotion();
  const session = useSession((s) => s.session);
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

    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      if (!session) {
        router.replace('/onboarding/welcome');
        return;
      }
      // Signed-in: check if quiz/onboarding is done. Onboarded users go straight
      // to home; otherwise drop into the welcome → quiz flow so we can capture
      // pain zones / goal / hours.
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .maybeSingle();
      if (cancelled) return;
      const onboarded = !error && !!data?.onboarding_completed;
      router.replace(onboarded ? '/main/home' : '/onboarding/welcome');
    }, reduceMotion ? 900 : 1900);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [reduceMotion, session, logoScale, logoOpacity, haloOpacity, wordOpacity, wordY, taglineOpacity]);

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

        {/* Animated logo — the REAL branded app icon in a rounded-corner
            (iOS squircle-ish) tile, not a hand-drawn SVG glyph. Tester
            asked for "красивая иконка со скруглениями" — this shows the
            actual designed icon.png the user loves. */}
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoImage}
            contentFit="cover"
          />
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
        <Animated.Text style={[styles.wordmark, wordStyle]}>DeskCare</Animated.Text>
        <View style={{ height: spacing.sm }} />
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          {t('splash_tagline')}
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
  logoImage: {
    width: 108,
    height: 108,
    borderRadius: 26, // ~24% — iOS app-icon squircle feel
    shadowColor: colors.primaryDeep,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
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
