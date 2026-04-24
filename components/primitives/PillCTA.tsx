import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Radii, Shadows, Typography } from '@/constants/tokens';
import { Text } from './Text';

interface PillCTAProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Icon rendered after the label */
  icon?: React.ReactNode;
}

export function PillCTA({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  icon,
}: PillCTAProps) {
  function handlePress() {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.wrapper,
        Shadows.float,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Gradient simulation: two overlapping layers */}
      <View style={styles.gradientStart} />
      <View style={styles.gradientEnd} />

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.onPrimary} />
        ) : (
          <>
            <Text
              variant="h3"
              color={Colors.onPrimary}
              style={styles.label}
            >
              {label}
            </Text>
            {icon != null && <View style={styles.icon}>{icon}</View>}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    borderRadius: Radii.full,
    minWidth: Layout.minTouchTarget,
    overflow: 'hidden',
  },
  gradientStart: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gradientStart,
  },
  gradientEnd: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gradientEnd,
    opacity: 0.55,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  label: {
    // override Typography.h3 color
  },
  icon: {
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
