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
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

/**
 * Welcome — the first screen after splash. Quiet sell: a promise + CTA.
 * Hero illustration is a continuous-line silhouette of a person mid
 * shoulder-roll, in the brand coral.
 */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const illoOpacity = useSharedValue(0);
  const illoScale = useSharedValue(0.92);
  const illoFloat = useSharedValue(0);
  const headOpacity = useSharedValue(0);
  const headY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    const dur = reduceMotion ? 200 : 540;
    illoOpacity.value = withTiming(1, { duration: dur });
    illoScale.value = withTiming(1, { duration: dur + 80, easing: Easing.out(Easing.cubic) });
    headOpacity.value = withDelay(260, withTiming(1, { duration: 460 }));
    headY.value = withDelay(260, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(520, withTiming(1, { duration: 420 }));

    if (!reduceMotion) {
      illoFloat.value = withRepeat(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
  }, [reduceMotion, illoOpacity, illoScale, illoFloat, headOpacity, headY, ctaOpacity]);

  const illoStyle = useAnimatedStyle(() => ({
    opacity: illoOpacity.value,
    transform: [
      { scale: illoScale.value },
      { translateY: -6 * illoFloat.value },
    ],
  }));
  const headStyle = useAnimatedStyle(() => ({
    opacity: headOpacity.value,
    transform: [{ translateY: headY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const begin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding/quiz/zone');
  };
  const signIn = () => {
    Haptics.selectionAsync();
    router.push('/auth/sign-in');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={260} opacity={0.20} />
      <DecorativeArc position="bottom-left" tone="peach" size={220} opacity={0.18} />

      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        <Animated.View style={[styles.eyebrowRow]}>
          <Eyebrow variant="accent">DESKCARE</Eyebrow>
        </Animated.View>

        <Animated.View style={[styles.illoWrap, illoStyle]}>
          <DeskPersonIllustration />
        </Animated.View>

        <Animated.View style={[styles.copy, headStyle]}>
          <Text style={styles.title}>Two minutes a day.{'\n'}Your neck stops aching.</Text>
          <Text style={styles.sub}>
            Micro-stretches right at your desk.{'\n'}No mat. No changing clothes.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.ctaBlock, ctaStyle]}>
          <PillCTA variant="primary" size="lg" breath onPress={begin}>
            Begin
          </PillCTA>
          <View style={{ height: spacing.md }} />
          <Pressable
            onPress={signIn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Sign in"
          >
            <Text style={styles.signInLink}>
              Already have an account?{' '}
              <Text style={styles.signInLinkAccent}>Sign in</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </AtmosphericBackground>
  );
}

/**
 * Continuous-line silhouette of a person mid shoulder-roll at a desk.
 * Coral gradient strokes — one thin, one thick — composed to feel "drawn".
 */
const DeskPersonIllustration: React.FC = () => {
  return (
    <Svg width={260} height={220} viewBox="0 0 260 220">
      <Defs>
        <SvgLinearGradient id="welcomeInk" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
          <Stop offset="0.5" stopColor={colors.primaryMid} stopOpacity="1" />
          <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="welcomeDesk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.primarySoft} stopOpacity="1" />
          <Stop offset="1" stopColor={colors.primaryLight} stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>

      {/* Desk surface — soft peach rectangle */}
      <Path
        d="M40 170 L220 170 L220 178 L40 178 Z"
        fill="url(#welcomeDesk)"
      />

      {/* Monitor */}
      <Path
        d="M82 100 Q82 92 90 92 L170 92 Q178 92 178 100 L178 156 Q178 164 170 164 L90 164 Q82 164 82 156 Z"
        fill="none"
        stroke="url(#welcomeInk)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Monitor stand */}
      <Path d="M126 164 L126 170 M112 170 L148 170" stroke="url(#welcomeInk)" strokeWidth="2" strokeLinecap="round" />

      {/* Person — head */}
      <Circle
        cx="210"
        cy="82"
        r="14"
        fill="none"
        stroke="url(#welcomeInk)"
        strokeWidth="2.5"
      />

      {/* Neck + tilted head nod (mid-roll release) */}
      <Path
        d="M210 96 L210 104"
        stroke="url(#welcomeInk)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Torso — back curve, slight lean forward */}
      <Path
        d="M210 104 Q214 130 212 156"
        fill="none"
        stroke="url(#welcomeInk)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Shoulder arc — the "roll" gesture — curved arrow-like */}
      <Path
        d="M198 110 Q180 100 186 120 Q190 126 202 120"
        fill="none"
        stroke="url(#welcomeInk)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Arm reaching toward keyboard — relaxed */}
      <Path
        d="M204 120 Q188 140 158 150"
        fill="none"
        stroke="url(#welcomeInk)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Small "release" mark — 3 tiny dots above the shoulder */}
      <Circle cx="172" cy="86" r="2" fill={colors.primaryMid} />
      <Circle cx="182" cy="80" r="1.6" fill={colors.primaryLight} />
      <Circle cx="164" cy="92" r="1.4" fill={colors.primaryLight} />

      {/* Keyboard indication — 4 soft dashes */}
      <Path d="M92 150 L106 150 M112 150 L126 150 M132 150 L146 150 M152 150 L166 150"
        stroke={colors.primarySoft}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
  },
  eyebrowRow: {
    alignItems: 'center',
  },
  illoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  ctaBlock: {
    alignItems: 'center',
  },
  signInLink: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
  },
  signInLinkAccent: {
    color: colors.primaryMid,
    fontFamily: typeScale.title.fontFamily,
  },
});
