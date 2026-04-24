import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Radii, Typography } from '@/constants/tokens';
import { Text } from './Text';

interface GhostButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function GhostButton({
  label,
  onPress,
  disabled = false,
  style,
  icon,
}: GhostButtonProps) {
  function handlePress() {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.wrapper,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon != null && <View style={styles.icon}>{icon}</View>}
        <Text variant="h3" color={Colors.onSurface} style={styles.label}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceHighest,
    minWidth: Layout.minTouchTarget,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  label: {
    color: Colors.onSurface,
  },
  icon: {},
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});
