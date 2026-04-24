import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Spacing } from '@/constants/tokens';

interface DividerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

const sizeMap = {
  sm:  Spacing.sm,
  md:  Spacing.md,
  lg:  Spacing.lg,
  xl:  Spacing.xxl,
} as const;

/**
 * Spacer-only divider. No line, no border.
 * Separation through whitespace only — per design rules.
 */
export function Divider({ size = 'md', style }: DividerProps) {
  return <View style={[{ height: sizeMap[size] }, style]} />;
}
