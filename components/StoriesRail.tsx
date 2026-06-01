import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typeScale } from '../constants/tokens';
import { Eyebrow, GlassCard } from './ui';
import { STORIES, type StoryTone } from '../lib/stories';
import { t } from '../lib/i18n';

// Map each story tone to a soft GlassCard tint — matches the airy, pale
// Quick Breaks / Your Zones aesthetic instead of vivid full-saturation
// gradients with white text (tester S3). GlassCard has no 'sky' tint → use
// the cool lavender for it.
type GlassTint = 'cream' | 'peach' | 'lavender' | 'mint' | 'coral';
const TONE_TINT: Record<StoryTone, GlassTint> = {
  coral: 'coral',
  lavender: 'lavender',
  mint: 'mint',
  peach: 'peach',
  sky: 'lavender',
};

/**
 * Horizontal Stories rail — bite-size desk-health + focus content.
 * Soft pastel GlassCard tiles (S3) with dark ink text. Tapping opens the
 * full-screen viewer.
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
        {STORIES.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => open(s.id)}
            accessibilityRole="button"
            accessibilityLabel={s.title}
            style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
          >
            <GlassCard tint={TONE_TINT[s.tone]} radius="xl" padding={spacing.lg} innerGradient>
              <View style={styles.cardInner}>
                <Text style={styles.kicker}>{s.label.toUpperCase()}</Text>
                <Text style={styles.title} numberOfLines={3}>{s.title}</Text>
                <Text style={styles.meta}>{t('home_stories_read')}</Text>
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const CARD_W = 150;
const CARD_H = 190;

const styles = StyleSheet.create({
  wrap: {
    // Uniform section gap (tester T4): For You→Learn now equals Learn→Quick
    // Breaks. All inter-block spacing on Home is driven by the NEXT section's
    // marginTop=xxl; bottom margin is 0 so RN's additive sibling margins don't
    // create the lopsided "small gap then big gap" the tester saw.
    marginTop: spacing.xxl,
    marginBottom: 0,
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
  cardWrap: {
    width: CARD_W,
  },
  cardInner: {
    height: CARD_H - 2 * spacing.lg,
    justifyContent: 'space-between',
  },
  kicker: {
    ...typeScale.labelSm,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typeScale.titleLg,
    color: colors.ink,
    fontWeight: '700',
  },
  meta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
  },
});
