import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Radii, Spacing } from '@/constants/tokens';
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
  function handlePress() {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(!value);
  }

  return (
    <View style={[styles.row, style]}>
      <View style={styles.textBlock}>
        <Text variant="body" color={disabled ? Colors.onSurfaceVar : Colors.onSurface}>
          {label}
        </Text>
        {description != null && (
          <Text variant="caption" color={Colors.onSurfaceVar}>
            {description}
          </Text>
        )}
      </View>

      <Pressable
        onPress={handlePress}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value, disabled }}
        style={({ pressed }) => [
          styles.track,
          value ? styles.trackOn : styles.trackOff,
          disabled && styles.trackDisabled,
          pressed && styles.trackPressed,
        ]}
      >
        <View style={[styles.thumb, { transform: [{ translateX: value ? THUMB_TRAVEL : 0 }] }]} />
      </Pressable>
    </View>
  );
}

const TRACK_W = 48;
const TRACK_H = 28;
const THUMB_SIZE = 22;
const THUMB_TRAVEL = TRACK_W - THUMB_SIZE - 6;

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

  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: Radii.full,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackOff: {
    backgroundColor: Colors.surfaceHighest,
  },
  trackOn: {
    backgroundColor: Colors.primary,
  },
  trackDisabled: {
    opacity: 0.4,
  },
  trackPressed: {
    opacity: 0.8,
  },

  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
