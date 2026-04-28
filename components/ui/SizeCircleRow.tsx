import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

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
                Platform.OS === 'ios' ? (
                  <BlurView
                    intensity={32}
                    tint="light"
                    style={[StyleSheet.absoluteFill, { borderRadius: size / 2, overflow: 'hidden' }]}
                  >
                    <View
                      pointerEvents="none"
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: 'rgba(232,123,78,0.78)', borderRadius: size / 2 },
                      ]}
                    />
                    <LinearGradient
                      pointerEvents="none"
                      colors={[
                        'rgba(255,255,255,0.10)',
                        'rgba(0,0,0,0)',
                        'rgba(0,0,0,0.08)',
                      ] as const}
                      locations={[0, 0.5, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </BlurView>
                ) : (
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: 'rgba(232,123,78,0.92)', borderRadius: size / 2 },
                    ]}
                  />
                )
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
