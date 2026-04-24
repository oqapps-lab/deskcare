import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '@/constants/tokens';
import { Text } from './Text';

type BadgeVariant = 'zone' | 'free' | 'premium' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  zone:    { bg: Colors.surfaceLow,     text: Colors.primary },
  free:    { bg: Colors.surfaceLow,     text: Colors.success },
  premium: { bg: Colors.primary,        text: Colors.onPrimary },
  neutral: { bg: Colors.surfaceHighest, text: Colors.onSurfaceVar },
};

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const { bg, text } = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text variant="label" upper color={text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
