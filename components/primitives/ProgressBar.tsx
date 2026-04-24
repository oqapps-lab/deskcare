import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '@/constants/tokens';

interface ProgressBarProps {
  /** 0–1 */
  value: number;
  style?: ViewStyle;
  /** Track height in dp */
  trackHeight?: number;
}

export function ProgressBar({
  value,
  style,
  trackHeight = 4,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <View
      style={[styles.track, { height: trackHeight }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, height: trackHeight },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
});
