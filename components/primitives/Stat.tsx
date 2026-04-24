import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Layout, Radii, Shadows, Spacing } from '@/constants/tokens';
import { Text } from './Text';

interface StatProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  /** Color of the value */
  valueColor?: string;
}

export function Stat({
  value,
  label,
  icon,
  style,
  valueColor = Colors.primary,
}: StatProps) {
  return (
    <View style={[styles.card, Shadows.card, style]}>
      {icon != null && <View style={styles.icon}>{icon}</View>}
      <Text variant="h1" color={valueColor} style={styles.value}>
        {value}
      </Text>
      <Text variant="bodyMd" color={Colors.onSurfaceVar}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Layout.cardPadding,
    gap: Spacing.xs,
    alignItems: 'flex-start',
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  value: {
    letterSpacing: -0.5,
  },
});
