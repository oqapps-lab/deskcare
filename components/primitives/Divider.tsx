import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Spacing } from '@/constants/tokens';

interface DividerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxxl';
  style?: ViewStyle;
}

const sizeMap = {
  xs:   Spacing.xs,
  sm:   Spacing.sm,
  md:   Spacing.md,
  lg:   Spacing.lg,
  xl:   Spacing.xxl,
  xxxl: Spacing.xxxl,
} as const;

/**
 * Spacer-only divider. No line, no border.
 * Separation through whitespace only — per design rules.
 */
export function Divider({ size = 'md', style }: DividerProps) {
  return <View style={[{ height: sizeMap[size] }, style]} />;
}
