import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients, radii, shadows, spacing, typeScale } from '../../constants/tokens';

export interface SizeCircleOption {
  value: string;
  label: string;
}

interface Props {
  options: readonly SizeCircleOption[]; // exactly 3 expected
  value: string | null;
  onChange: (value: string) => void;
}

/**
 * Three growing circles for "how many hours at desk?" — the circles literally
 * grow left to right because the visual IS the meaning. Active one gets a
 * coral ring + solid fill + white label.
 */
export const SizeCircleRow: React.FC<Props> = ({ options, value, onChange }) => {
  const sizes = [64, 80, 96];

  return (
    <View style={styles.row}>
      {options.map((opt, i) => {
        const size = sizes[i] ?? 64;
        const active = value === opt.value;

        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(opt.value);
            }}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: active }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.circle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
                active ? styles.circleActive : styles.circleInactive,
                active && shadows.chip,
              ]}
            >
              {active && (
                <LinearGradient
                  colors={gradients.chipActive as unknown as readonly [string, string, ...string[]]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
                />
              )}
              <Text
                style={[styles.value, active ? styles.valueActive : styles.valueInactive]}
              >
                {opt.value}
              </Text>
            </View>
            <Text style={styles.label}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  item: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleInactive: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
  },
  circleActive: {
    backgroundColor: 'transparent',
  },
  value: {
    ...typeScale.titleLg,
    fontFamily: typeScale.headline.fontFamily,
  },
  valueActive: {
    color: colors.white,
  },
  valueInactive: {
    color: colors.primaryDeep,
  },
  label: {
    ...typeScale.label,
    color: colors.inkSubtle,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
