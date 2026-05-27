import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { colors, spacing, typeScale } from '../constants/tokens';
import { GlassCard, VideoPlaceholder } from './ui';
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

const CARD_WIDTH = 220;

const BreathingCard: React.FC<{ card: ForYouCard; index: number }> = ({ card, index }) => {
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(0.95);

  useEffect(() => {
    if (reduceMotion) return;
    breath.value = withDelay(
      index * 300,
      withRepeat(
        withTiming(1.04, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
  }, [breath, reduceMotion, index]);

  const figureStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value }],
  }));

  const onPress = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/exercise/preview', params: { routine: card.routineSlug } } as never);
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${card.title}, ${card.minutes} minute routine`}
      style={({ pressed }) => [pressed && styles.pressed, styles.cardWrap]}
    >
      <GlassCard tint={card.tone} radius="xl" padding={spacing.lg}>
        <View style={styles.figureWrap}>
          <Animated.View style={figureStyle}>
            <VideoPlaceholder pose={card.pose} compact={false} />
          </Animated.View>
        </View>
        <Text style={styles.minutesEyebrow}>{card.minutes} MIN</Text>
        <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
      </GlassCard>
    </Pressable>
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
  figureWrap: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  minutesEyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginBottom: 2,
  },
  title: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
});
