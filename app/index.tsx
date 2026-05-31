import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { colors } from '../constants/tokens';
import { useSession } from '../lib/store/session';
import { supabase } from '../lib/supabase';

/**
 * Splash screen — animated brand mark → auto-routes to the onboarding flow
 * after ~1.8s. Entry point of the demo experience. No debug UI.
 */
export default function Splash() {
  const reduceMotion = useReducedMotion();
  const session = useSession((s) => s.session);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Gentle fade so this reads as a continuation of the native splash
    // (same white bg + same rounded icon), NOT a separate second screen.
    logoOpacity.value = withTiming(1, { duration: reduceMotion ? 120 : 280 });

    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      if (!session) {
        router.replace('/onboarding/welcome');
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .maybeSingle();
      if (cancelled) return;
      const onboarded = !error && !!data?.onboarding_completed;
      router.replace(onboarded ? '/main/home' : '/onboarding/welcome');
    }, reduceMotion ? 500 : 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [reduceMotion, session, logoOpacity]);

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));

  // ONE clean splash: white canvas + the rounded app icon, no halo, no
  // coral shadow/ring, no wordmark (tester S1: kill the red outline + the
  // jarring second logo screen). Matches the native splash so launch feels
  // like a single continuous screen.
  return (
    <View style={styles.bg}>
      <View style={styles.root}>
        <Animated.View style={logoStyle}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logoImage}
            contentFit="cover"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.canvas, // matches the native splash bg
  },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 22, // rounded app-icon squircle; no coral shadow/ring (S1)
  },
});
