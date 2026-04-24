import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Radii, Spacing } from '@/constants/tokens';
import { Text } from './Text';

interface PillCTAProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  /** Gradient direction: horizontal (default) or diagonal */
  direction?: 'horizontal' | 'diagonal';
}

export function PillCTA({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  icon,
  direction = 'horizontal',
}: PillCTAProps) {
  function handlePress() {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const start = direction === 'diagonal' ? { x: 0, y: 0 } : { x: 0, y: 0.5 };
  const end   = direction === 'diagonal' ? { x: 1, y: 1 } : { x: 1, y: 0.5 };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.wrapper,
        styles.glow,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={[Colors.gradientStart, Colors.primaryLight, Colors.gradientEnd]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.onPrimary} />
        ) : (
          <>
            <Text variant="h3" color={Colors.onPrimary} style={styles.label}>
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
    height: 58,
    borderRadius: Radii.full,
    minWidth: Layout.minTouchTarget,
    overflow: 'hidden',
  },
  glow: Platform.select({
    ios: {
      shadowColor: Colors.primaryLight,
      shadowOpacity: 0.55,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 10 },
    default: {},
  }) ?? {},
  content: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
  },
  label: {},
  icon: {},
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
});
