import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Radii } from '@/constants/tokens';

type Variant = 'surface' | 'primary' | 'ghost';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: Variant;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = Layout.minTouchTarget,
  style,
  disabled = false,
}: IconButtonProps) {
  function handlePress() {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const bg: Record<Variant, string> = {
    surface: Colors.surface,
    primary: Colors.primary,
    ghost:   'transparent',
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Radii.full,
          backgroundColor: bg[variant],
        },
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});
