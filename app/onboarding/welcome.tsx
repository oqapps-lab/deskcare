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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  BgPattern,
  DecorativeArc,
  Eyebrow,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { t } from '../../lib/i18n';

/**
 * Background video for the welcome hero. Neck lateral-tilt loop — a calm
 * head-tilt L/R motion (NOT the old hunching cat-cow) that matches the
 * "Your neck stops aching" copy. Bundled LOCALLY via require() so it plays
 * instantly with zero network buffering — the previous Supabase-streamed
 * URL lagged badly on first open. Muted, looping, autoplay.
 */
const HERO_VIDEO_SOURCE = require('../../assets/welcome-hero.mp4');

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
    <View style={{ flex: 1, backgroundColor: colors.canvas, overflow: 'hidden' }}>
      {/* Looping cat-cow video as ambient background — muted, autoplays.
          Sits behind a brand-coral gradient scrim so the copy stays
          readable regardless of which frame is on-screen. */}
      <HeroVideo />

      {/* Light top wash (very subtle, just enough to seat the DESKCARE
          eyebrow) + a strong canvas gradient on the bottom half where the
          copy + CTAs live. No more heavy brown scrim — the title/sub now
          render as DARK ink on near-solid canvas, so they read cleanly
          instead of white-on-video. */}
      <LinearGradient
        colors={[
          'rgba(251,249,245,0.28)',
          'rgba(251,249,245,0)',
          'rgba(251,249,245,0)',
          'rgba(251,249,245,0.86)',
          'rgba(251,249,245,1)',
        ]}
        locations={[0, 0.14, 0.5, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

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
          <Eyebrow variant="accent" style={styles.eyebrowOnVideo}>{t('brand_eyebrow')}</Eyebrow>
        </Animated.View>

        {/* Spacer where the SVG illo used to be — now the video itself
            is the visual. Keeps the layout's vertical rhythm. */}
        <Animated.View style={[styles.illoSpacer, illoStyle]} />

        <Animated.View style={[styles.copy, headStyle]}>
          <Text style={[styles.title, styles.titleOnVideo]}>{t('welcome_title')}</Text>
          <Text style={[styles.sub, styles.subOnVideo]}>{t('welcome_sub')}</Text>
        </Animated.View>

        <Animated.View style={[styles.ctaBlock, ctaStyle]}>
          <PillCTA variant="primary" size="lg" breath onPress={begin}>
            {t('welcome_cta_begin')}
          </PillCTA>
          <View style={{ height: spacing.md }} />
          <Pressable
            onPress={signIn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`${t('welcome_signin_q')} ${t('welcome_signin_link')}`}
          >
            <Text style={styles.signInLink}>
              {t('welcome_signin_q')}{' '}
              <Text style={styles.signInLinkAccent}>{t('welcome_signin_link')}</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Atmospheric overlays sit ABOVE the video so the brand wash isn't
          completely lost — but at low opacity so the video reads cleanly. */}
      <BgPattern variant="waves" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={260} opacity={0.16} />
    </View>
  );
}

const HeroVideo: React.FC = () => {
  const player = useVideoPlayer(HERO_VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      // Bleed 2px past top/bottom (parent clips) to hide the source edge line (S4).
      style={{ position: 'absolute', top: -2, bottom: -2, left: 0, right: 0 }}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
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
  eyebrowOnVideo: {
    color: colors.primaryDeep,
  },
  illoSpacer: {
    flex: 1,
  },
  copy: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  titleOnVideo: {
    color: colors.ink,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subOnVideo: {
    color: colors.inkMuted,
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
