import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../constants/tokens';

interface Props {
  size?: number;
  rings?: number;
}

/**
 * Concentric coral pulse rings with staggered fade+scale animation.
 * Used on sync / loading screens. Infinite loop, respects Reduce Motion by
 * rendering static rings when user prefers.
 */
export const PulseRings: React.FC<Props> = ({ size = 220, rings = 4 }) => {
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {Array.from({ length: rings }).map((_, i) => (
        <PulseRing key={i} size={size} index={i} total={rings} />
      ))}
      {/* central dot */}
      <View style={[styles.dot, { backgroundColor: colors.primaryMid }]} />
    </View>
  );
};

const PulseRing: React.FC<{ size: number; index: number; total: number }> = ({
  size,
  index,
  total,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 400,
      withRepeat(
        withTiming(1, {
          duration: 1600,
          easing: Easing.bezier(0.25, 0.5, 0.25, 1),
        }),
        -1,
        false,
      ),
    );
  }, [progress, index]);

  const animatedStyle = useAnimatedStyle(() => {
    const startR = (size / (total * 2)) * (index + 1);
    const endR = (size / 2) * (0.45 + 0.55 * ((index + 1) / total));
    const r = startR + (endR - startR) * progress.value;
    const opacity = 0.55 * (1 - progress.value);
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.ring,
        animatedStyle,
        { borderColor: colors.primaryMid },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
