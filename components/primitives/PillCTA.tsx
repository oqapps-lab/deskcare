import React from 'react';
import {
  Pressable, StyleSheet, View, ViewStyle, TextStyle,
  ActivityIndicator, Platform,
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
  direction?: 'horizontal' | 'diagonal';
  gradientColors?: readonly [string, string, ...string[]];
  labelGlow?: boolean;
}

export function PillCTA({
  label, onPress, disabled = false, loading = false,
  style, icon, direction = 'horizontal',
  gradientColors, labelGlow = false,
}: PillCTAProps) {
  function handlePress() {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const start = direction === 'diagonal' ? { x: 0, y: 0 } : { x: 0, y: 0.5 };
  const end   = direction === 'diagonal' ? { x: 1, y: 1 } : { x: 1, y: 0.5 };
  const colors = gradientColors ?? (['#2271B3', '#4A9FD9'] as const);

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
        colors={colors}
        start={start}
        end={end}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.topEdge} />

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.onPrimary} />
        ) : (
          <>
            <Text
              variant="h3"
              color={Colors.onPrimary}
              style={labelGlow ? styles.glowLabel : undefined}
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
  glow: Platform.select({
    ios: {
      shadowColor: '#4A9FD9',
      shadowOpacity: 0.22,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 6 },
    default: {},
  }) ?? {},
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radii.full,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
  },
  icon: {},
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  glowLabel: {
    textShadowColor: 'rgba(0, 235, 255, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  } satisfies TextStyle,
});
