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
  coral: ['#E87B4E', '#7E2C03'],
  lavender: ['#9B8EB4', '#3E3457'],
  mint: ['#6BA485', '#2F5C46'],
  peach: ['#FFB599', '#8A3D12'],
  sky: ['#5B8CA0', '#234E5E'],
};

/**
 * Horizontal "stories" rail — IG-style tappable bubbles that open the
 * full-screen tap-through story viewer. Bite-size desk-health + focus
 * content. Added 2026-05-31 to give the app залипательный content beyond
 * exercise videos.
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
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <LinearGradient colors={[a, b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bubble}>
                <View style={styles.bubbleInner}>
                  <Text style={[styles.glyph, { color: a }]}>{s.glyph}</Text>
                </View>
              </LinearGradient>
              <Text style={styles.label} numberOfLines={1}>{s.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const BUBBLE = 68;

const styles = StyleSheet.create({
  wrap: {
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
  item: {
    width: BUBBLE + 8,
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  bubbleInner: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: BUBBLE / 2,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  glyph: {
    fontSize: 28,
  },
  label: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
