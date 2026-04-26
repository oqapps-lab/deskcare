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
import { ClayIllustration } from '../../components/ui/ClayIllustration';
import { PillCTA } from '../../components/ui/PillCTA';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { colors, spacing, typeScale } from '../../constants/tokens';

/**
 * Offline error. Terminal screen of the demo flow — "Попробовать снова"
 * restarts from the onboarding permission screen, "Работать офлайн" does the same.
 */
export default function NoConnectionScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const illoOpacity = useSharedValue(0);
  const illoScale = useSharedValue(0.88);
  const illoFloat = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    const dur = reduceMotion ? 200 : 500;
    illoOpacity.value = withTiming(1, { duration: dur });
    illoScale.value = withTiming(1, { duration: dur + 100, easing: Easing.out(Easing.cubic) });
    textOpacity.value = withDelay(250, withTiming(1, { duration: 450 }));
    textY.value = withDelay(250, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

    if (!reduceMotion) {
      illoFloat.value = withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
  }, [reduceMotion, illoOpacity, illoScale, illoFloat, textOpacity, textY, ctaOpacity]);

  const illoStyle = useAnimatedStyle(() => ({
    opacity: illoOpacity.value,
    transform: [
      { scale: illoScale.value },
      { translateY: -6 * illoFloat.value },
    ],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
  }));

  const retry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/onboarding/permission');
  };
  const offline = () => {
    Haptics.selectionAsync();
    router.replace('/onboarding/permission');
  };

  return (
    <AtmosphericBackground>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
      >
        <View style={styles.eyebrowRow}>
          <Eyebrow>OFFLINE</Eyebrow>
        </View>

        <View style={styles.center}>
          <Animated.View style={[styles.illoCluster, illoStyle]}>
            <ClayIllustration name="wifi-cloud" size={220} />
          </Animated.View>

          <Animated.View style={textStyle}>
            <Text style={styles.title}>No network{'\n'}connection</Text>
            <Text style={styles.subtitle}>
              Check your connection or hang tight —{'\n'}we'll retry automatically
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.ctaCluster, ctaStyle]}>
          <PillCTA
            variant="primary"
            size="lg"
            icon="refresh"
            breath
            onPress={retry}
          >
            Try again
          </PillCTA>
          <View style={{ height: spacing.md }} />
          <Pressable
            onPress={offline}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Continue offline"
          >
            <Text style={styles.ghostLink}>Work offline</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowRow: {
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  illoCluster: {
    marginBottom: spacing.xxxl,
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
  ctaCluster: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  ghostLink: {
    ...typeScale.title,
    color: colors.primaryMid,
    textAlign: 'center',
  },
});
