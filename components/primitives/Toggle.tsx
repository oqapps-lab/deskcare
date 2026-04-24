import React from 'react';
import { Switch, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Layout, Spacing } from '@/constants/tokens';
import { Text } from './Text';

interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Toggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  style,
}: ToggleProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.textBlock}>
        <Text variant="body" color={Colors.onSurface}>
          {label}
        </Text>
        {description != null && (
          <Text variant="caption" color={Colors.onSurfaceVar}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.surfaceHighest, true: Colors.primary }}
        thumbColor={Colors.surface}
        ios_backgroundColor={Colors.surfaceHighest}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Layout.minTouchTarget,
    gap: Spacing.lg,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
});
