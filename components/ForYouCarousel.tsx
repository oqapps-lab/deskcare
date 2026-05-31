import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors, spacing, typeScale } from '../constants/tokens';
import { GlassCard } from './ui';
import type { ForYouCard } from '../hooks/useForYouRotation';

/**
 * "For You Today" — horizontally-scrolling 3-card carousel.
 * Each card has a subtle "breathing" pulse on its illustration to feel alive.
 * Rotates daily (seeded by date + primary zone — see useForYouRotation).
 */
export const ForYouCarousel: React.FC<{ cards: ForYouCard[] }> = ({ cards }) => {
  if (cards.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + spacing.md}
      snapToAlignment="start"
    >
      {cards.map((c, i) => (
        <BreathingCard key={c.id} card={c} index={i} />
      ))}
    </ScrollView>
  );
};

const CARD_WIDTH = 160;

/** Muted, looping exercise clip filling the top of the card. Replaces the
 *  hand-drawn pose illustration the tester disliked. Source is a local
 *  require() so it paints instantly — no network buffering. */
const CardVideo: React.FC<{ source: number }> = ({ source }) => {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
};

const BreathingCard: React.FC<{ card: ForYouCard; index: number }> = ({ card, index }) => {
  const reduceMotion = useReducedMotion();

  const onPress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/exercise/preview', params: { routine: card.routineSlug } } as never);
  };

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(80 + index * 120).duration(380).springify().damping(15)}
    >
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${card.title}, ${card.minutes} minute routine`}
      style={({ pressed }) => [pressed && styles.pressed, styles.cardWrap]}
    >
      <GlassCard tint={card.tone} radius="xl" padding={spacing.sm}>
        <View style={styles.videoWrap}>
          <CardVideo source={card.videoSource} />
          <View style={styles.minutesBadge}>
            <Text style={styles.minutesBadgeText}>{card.minutes} MIN</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
      </GlassCard>
    </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.xxl,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  cardWrap: {
    width: CARD_WIDTH,
  },
  pressed: {
    opacity: 0.92,
  },
  videoWrap: {
    height: 210, // portrait — the full standing/seated figure fits (tester R7)
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  minutesBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  minutesBadgeText: {
    ...typeScale.labelSm,
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: {
    ...typeScale.titleLg,
    color: colors.ink,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
