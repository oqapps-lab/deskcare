import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from './GlassCard';
import { IconHalo, type HaloTone } from './IconHalo';
import type { GlyphName } from './Glyph';
import { colors, radii, shadows, spacing, typeScale } from '../../constants/tokens';

type Tint = 'cream' | 'peach' | 'lavender' | 'mint' | 'coral';

interface Props {
  label: string;
  icon: GlyphName;
  /** Optional custom SVG — renders instead of Glyph when provided. */
  customIcon?: React.ReactNode;
  tone: HaloTone;
  tint?: Tint;
  active: boolean;
  onPress: () => void;
}

/**
 * Quiz grid tile — large selectable card with a halo icon above a label.
 * Active state: coral outline glow + warmer tint. Inactive: neutral glass.
 */
export const QuizTile: React.FC<Props> = ({
  label,
  icon,
  customIcon,
  tone,
  tint = 'cream',
  active,
  onPress,
}) => {
  const handle = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handle}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.wrap,
        active && styles.wrapActive,
        pressed && styles.pressed,
      ]}
    >
      <GlassCard
        tint={active ? tint : 'cream'}
        radius="lg"
        padding={spacing.lg}
        innerGradient={active}
      >
        <View style={styles.inner}>
          {customIcon ?? (
            <IconHalo
              icon={icon}
              size="md"
              tone={tone}
              variant={active ? 'gradient' : 'tinted'}
              glow={active}
            />
          )}
          <Text
            style={[styles.label, active && styles.labelActive]}
            numberOfLines={2}
          >
            {label}
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: radii.lg,
  },
  wrapActive: {
    ...shadows.chip,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  inner: {
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 108,
    justifyContent: 'center',
  },
  label: {
    ...typeScale.title,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.ink,
    fontFamily: typeScale.titleLg.fontFamily,
  },
});
