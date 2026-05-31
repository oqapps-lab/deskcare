import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typeScale } from '../constants/tokens';
import { Eyebrow } from './ui';
import { STORIES, type StoryTone } from '../lib/stories';
import { t } from '../lib/i18n';

const TONE_GRADIENT: Record<StoryTone, [string, string]> = {
  coral: ['#E87B4E', '#9D431A'],
  lavender: ['#9B8EB4', '#4A3F63'],
  mint: ['#6BA485', '#34614A'],
  peach: ['#F0A579', '#A85726'],
  sky: ['#6E9DB0', '#2E5566'],
};

/**
 * Horizontal Stories rail — bite-size desk-health + focus content.
 * Redesigned 2026-05-31 (tester R9): the old circular letter-monogram
 * bubbles (D/E/P/F/W) looked terrible. Now each story is a tall rounded
 * gradient CARD with its title — premium editorial tiles, no ugly letters
 * and no photo assets required. Tapping opens the full-screen viewer.
 */
export const StoriesRail: React.FC = () => {
  const open = (id: string) => {
    Haptics.selectionAsync();
    router.push(`/stories/${id}` as never);
  };

  return (
    <View style={styles.wrap}>
      <Eyebrow>{t('home_stories_eyebrow')}</Eyebrow>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {STORIES.map((s) => {
          const [a, b] = TONE_GRADIENT[s.tone];
          return (
            <Pressable
              key={s.id}
              onPress={() => open(s.id)}
              accessibilityRole="button"
              accessibilityLabel={s.title}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <LinearGradient
                colors={[a, b]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.kicker}>{s.label.toUpperCase()}</Text>
                <Text style={styles.title} numberOfLines={3}>{s.title}</Text>
                <Text style={styles.meta}>{t('home_stories_read')}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const CARD_W = 150;
const CARD_H = 190;

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl, // breathing room from the For You carousel (R9)
    marginBottom: spacing.lg,
  },
  scroll: {
    marginHorizontal: -spacing.xxl,
    marginTop: spacing.sm,
  },
  row: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  kicker: {
    ...typeScale.labelSm,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typeScale.titleLg,
    color: '#fff',
    fontWeight: '700',
  },
  meta: {
    ...typeScale.labelSm,
    color: 'rgba(255,255,255,0.92)',
    textTransform: 'uppercase',
  },
});
