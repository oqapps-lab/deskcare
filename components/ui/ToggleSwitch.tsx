import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients, radii, shadows } from '../../constants/tokens';

interface Props {
  value: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}

const TRACK_W = 52;
const TRACK_H = 32;
const THUMB = 26;

/**
 * Custom toggle switch. On-state uses coral gradient track + white glass thumb.
 * Off-state uses warm surfaceHigh track + canvas thumb.
 * Animates thumb translate via reanimated; haptic on flip.
 */
export const ToggleSwitch: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const x = useSharedValue(value ? TRACK_W - THUMB - 3 : 3);

  useEffect(() => {
    x.value = withTiming(value ? TRACK_W - THUMB - 3 : 3, { duration: 180 });
  }, [value, x]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    onChange?.(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
      style={[styles.track, { opacity: disabled ? 0.4 : 1 }]}
    >
      <View
        style={[
          styles.trackBg,
          { backgroundColor: value ? 'transparent' : colors.surfaceHigh },
        ]}
      >
        {value && (
          <LinearGradient
            colors={gradients.toggleOn as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
      <Animated.View
        style={[
          styles.thumb,
          thumbStyle,
          value ? shadows.chip : shadows.soft,
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: radii.pill,
    justifyContent: 'center',
    overflow: 'visible',
  },
  trackBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    top: (TRACK_H - THUMB) / 2,
    backgroundColor: colors.white,
  },
});
