import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, spacing, typeScale } from '../constants/tokens';
import type { AchievementWithProgress } from '../hooks/useAchievements';

/**
 * Visual badge for an achievement. Renders an inline SVG keyed by slug
 * prefix — no remote icons needed for v1. Locked badges are muted/grey.
 */
const BadgeIcon: React.FC<{ slug: string; size: number; color: string }> = ({ slug, size, color }) => {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  const key = slug.split('_')[0]; // 'streak', 'sessions', 'minutes', 'pain', 'eye', 'first'
  let content: React.ReactNode;
  switch (key) {
    case 'streak':
      content = (
        <>
          <Path d="M12 2 L14 9 L21 9 L15.5 13 L17.5 20 L12 16 L6.5 20 L8.5 13 L3 9 L10 9 Z" {...stroke} />
        </>
      );
      break;
    case 'sessions':
      content = (
        <>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M12 7 L12 12 L16 14" {...stroke} />
        </>
      );
      break;
    case 'minutes':
      content = (
        <>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="M8 12 L12 16 L17 9" {...stroke} />
        </>
      );
      break;
    case 'pain':
      content = (
        <>
          <Path d="M12 21s-7-5.5-7-11a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 11-7 11z" {...stroke} />
        </>
      );
      break;
    case 'eye':
      content = (
        <>
          <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" {...stroke} />
          <Circle cx="12" cy="12" r="3" {...stroke} />
        </>
      );
      break;
    case 'first':
    default:
      content = (
        <>
          <Path d="M5 13 L10 18 L20 6" {...stroke} />
        </>
      );
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {content}
    </Svg>
  );
};

const Badge: React.FC<{ a: AchievementWithProgress }> = ({ a }) => {
  const unlocked = !!a.earned_at;
  return (
    <View style={styles.badge}>
      <View style={[styles.badgeIconWrap, unlocked ? styles.badgeIconWrapUnlocked : styles.badgeIconWrapLocked]}>
        <BadgeIcon
          slug={a.slug}
          size={28}
          color={unlocked ? colors.primaryDeep : colors.inkSubtle}
        />
      </View>
      <Text
        style={[styles.badgeTitle, !unlocked && styles.badgeTitleLocked]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {a.title}
      </Text>
    </View>
  );
};

export const AchievementGrid: React.FC<{ items: AchievementWithProgress[]; maxRows?: number }> = ({
  items,
  maxRows,
}) => {
  // Sort unlocked first, then by sort_order.
  const sorted = [...items].sort((a, b) => {
    if (!!a.earned_at !== !!b.earned_at) return a.earned_at ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const trimmed = typeof maxRows === 'number' ? sorted.slice(0, maxRows * 4) : sorted;

  if (trimmed.length === 0) return null;
  return (
    <View style={styles.grid}>
      {trimmed.map((a) => (
        <Badge key={a.id} a={a} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  badge: {
    width: '22%',
    alignItems: 'center',
  },
  badgeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeIconWrapUnlocked: {
    backgroundColor: colors.primarySoft,
  },
  badgeIconWrapLocked: {
    backgroundColor: colors.surfaceMid,
    opacity: 0.7,
  },
  badgeTitle: {
    ...typeScale.labelSm,
    color: colors.ink,
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: colors.inkSubtle,
  },
});
