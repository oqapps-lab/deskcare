import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii } from '../../constants/tokens';

interface Props {
  /** Progress value 0..1 */
  value: number;
  height?: number;
  accessibilityLabel?: string;
}

/**
 * Thin horizontal progress bar for onboarding step indication.
 * Track is warm hairline, fill is coral gradient. Animates smoothly on value change.
 */
export const ProgressBar: React.FC<Props> = ({
  value,
  height = 6,
  accessibilityLabel,
}) => {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(Math.max(0, Math.min(1, value)));

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, value));
    progress.value = withTiming(clamped, {
      duration: reduceMotion ? 120 : 480,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, progress, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={[styles.track, { height, borderRadius: radii.pill }]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(Math.max(0, Math.min(1, value)) * 100),
      }}
    >
      <Animated.View
        style={[
          styles.fillWrap,
          fillStyle,
          { backgroundColor: colors.primaryMid, borderRadius: radii.pill },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: colors.inkHairline,
    overflow: 'hidden',
  },
  fillWrap: {
    height: '100%',
    overflow: 'hidden',
  },
});
