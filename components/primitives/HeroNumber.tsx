import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Typography } from '@/constants/tokens';
import { Text } from './Text';

interface HeroNumberProps {
  value: string | number;
  label?: string;
  unit?: string;
  /** Color of the big number */
  color?: string;
  style?: ViewStyle;
  center?: boolean;
}

export function HeroNumber({
  value,
  label,
  unit,
  color = Colors.primary,
  style,
  center = false,
}: HeroNumberProps) {
  return (
    <View style={[styles.wrapper, center && styles.centered, style]}>
      <View style={styles.row}>
        <Text variant="display" color={color} style={styles.value}>
          {value}
        </Text>
        {unit != null && (
          <Text variant="h2" color={color} style={styles.unit}>
            {unit}
          </Text>
        )}
      </View>
      {label != null && (
        <Text variant="bodyMd" color={Colors.onSurfaceVar}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  centered: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    lineHeight: Typography.display.fontSize * 1.1,
  },
  unit: {
    marginBottom: 6,
  },
});
