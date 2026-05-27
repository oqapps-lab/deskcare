import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { colors, spacing, typeScale } from '../constants/tokens';
import type { UnlockedAchievement } from '../hooks/useAchievements';
import { t } from '../lib/i18n';

/**
 * Celebration overlay when one (or more) achievements unlock at end of session.
 * Shows the first item as a centered card with halo + bold tick + title +
 * "Achievement unlocked" eyebrow. Tap-to-dismiss; auto-dismisses after 4s.
 *
 * Multi-unlock case (rare, only on milestone catch-ups): cards stack with
 * staggered enter — but for v1 we just show the first; the rest appear on
 * the Profile screen badge grid.
 */
export const AchievementUnlockOverlay: React.FC<{
  items: UnlockedAchievement[];
  onDismiss: () => void;
}> = ({ items, onDismiss }) => {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const haloScale = useSharedValue(0.8);

  useEffect(() => {
    if (items.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const d = reduceMotion ? 180 : 420;
    opacity.value = withTiming(1, { duration: d });
    scale.value = withSequence(
      withTiming(1.05, { duration: d, easing: Easing.out(Easing.back(1.6)) }),
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
    );
    haloScale.value = withDelay(reduceMotion ? 0 : 80, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));

    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 220 }, () => {
        // run after fade-out — but RN reanimated worklet → use callback
      });
      setTimeout(onDismiss, 240);
    }, 4000);
    return () => clearTimeout(t);
    // Re-fire only when the items list identity changes (length 0 → 1 etc.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloScale.value,
  }));

  if (items.length === 0) return null;
  const first = items[0];
  const restCount = items.length - 1;

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => {
        Haptics.selectionAsync();
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(onDismiss, 220);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Achievement unlocked: ${first.title}`}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, wrapStyle]}>
          <Animated.View style={[styles.haloWrap, haloStyle]} pointerEvents="none">
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Defs>
                <SvgRadialGradient id="ach-halo" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="0.85" />
                  <Stop offset="0.6" stopColor={colors.primaryMid} stopOpacity="0.30" />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                </SvgRadialGradient>
              </Defs>
              <Circle cx="100" cy="100" r="95" fill="url(#ach-halo)" />
            </Svg>
          </Animated.View>

          <View style={styles.medalWrap}>
            <Svg width={80} height={80} viewBox="0 0 80 80">
              <Defs>
                <SvgRadialGradient id="ach-medal" cx="50%" cy="35%" r="70%">
                  <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
                  <Stop offset="1" stopColor={colors.primaryDeep} stopOpacity="1" />
                </SvgRadialGradient>
              </Defs>
              <Circle cx="40" cy="40" r="32" fill="url(#ach-medal)" />
              <Circle cx="40" cy="40" r="22" fill={colors.primaryDeep} fillOpacity={0.35} />
              {/* star inside */}
              <Path
                d="M40 22 L44 35 L57 35 L46.5 43 L51 56 L40 48 L29 56 L33.5 43 L23 35 L36 35 Z"
                fill={colors.surfaceCard}
              />
            </Svg>
          </View>

          <Text style={styles.eyebrow}>{t('ach_unlock_eyebrow')}</Text>
          <Text style={styles.title} numberOfLines={2}>{first.title}</Text>
          {first.description && (
            <Text style={styles.subtitle} numberOfLines={3}>{first.description}</Text>
          )}
          {restCount > 0 && (
            <Text style={styles.more}>{t('ach_unlock_more', { n: restCount })}</Text>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,15,12,0.45)',
  },
  card: {
    width: 280,
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surfaceCard,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  haloWrap: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  medalWrap: {
    marginBottom: spacing.md,
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryMid,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  title: {
    ...typeScale.headlineSm,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  more: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    marginTop: spacing.md,
  },
});
