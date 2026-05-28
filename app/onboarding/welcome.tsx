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
 * Background video for the welcome hero. Cat-cow loop — the most universal
 * stretching motion + visually matches "Two minutes a day. Your neck stops
 * aching." copy. Muted, looping, autoplay; falls through gracefully when
 * the player isn't ready (overlay gradient + brand color keep the screen
 * looking intentional even on a black frame).
 */
const HERO_VIDEO_URL =
  'https://wnmjdxmrpmucfoluxhly.supabase.co/storage/v1/object/public/exercise-videos/seated-cat-cow/video.mp4';

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
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Looping cat-cow video as ambient background — muted, autoplays.
          Sits behind a brand-coral gradient scrim so the copy stays
          readable regardless of which frame is on-screen. */}
      <HeroVideo />

      {/* Warm-to-canvas gradient scrim — keeps text readable + ties the
          video into the app's color world. Top of screen darker for the
          eyebrow/copy, bottom blends into canvas for the CTAs. */}
      <LinearGradient
        colors={[
          'rgba(94,33,3,0.72)',
          'rgba(126,44,3,0.45)',
          'rgba(251,249,245,0.55)',
          'rgba(251,249,245,0.98)',
        ]}
        locations={[0, 0.42, 0.72, 1]}
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
  const player = useVideoPlayer(HERO_VIDEO_URL, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
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
    color: '#FFE4D2',
  },
  illoSpacer: {
    height: 260,
  },
  copy: {
    alignItems: 'center',
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  titleOnVideo: {
    color: colors.canvas,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subOnVideo: {
    color: 'rgba(251,249,245,0.92)',
    textShadowColor: 'rgba(0,0,0,0.32)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
