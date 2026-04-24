import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { Text } from './Text';

interface EyebrowProps {
  label: string;
  /** Color of the text — defaults to primary */
  color?: string;
  /** Show as a pill badge (background tint) */
  badge?: boolean;
  style?: ViewStyle;
}

export function Eyebrow({
  label,
  color = Colors.primary,
  badge = false,
  style,
}: EyebrowProps) {
  if (badge) {
    return (
      <View style={[styles.badge, style]}>
        <Text variant="label" upper color={color} style={styles.badgeText}>
          {label}
        </Text>
      </View>
    );
  }

  return (
    <Text variant="label" upper color={color} style={style}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    letterSpacing: 0.6,
  },
});
