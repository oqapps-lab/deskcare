import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients, radii, shadows } from '../../constants/tokens';

interface Props {
  value: number; // 0..1
  onChange?: (v: number) => void;
}

/**
 * Warm gradient slider for pain severity. Track fades cream → coral → deep.
 * Thumb is white glass disc with warm shadow.
 */
export const SeveritySlider: React.FC<Props> = ({ value, onChange }) => {
  const trackW = useSharedValue(0);
  const x = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackW.value = w;
    x.value = value * (w - 28);
  };

  const triggerHaptic = () => {
    // Fire-and-forget — swallow the Promise so Hermes strict doesn't warn.
    void Haptics.selectionAsync();
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      x.value = Math.min(Math.max(0, e.x - 14), trackW.value - 28);
    })
    .onUpdate((e) => {
      x.value = Math.min(Math.max(0, e.x - 14), trackW.value - 28);
    })
    .onEnd(() => {
      if (onChange) {
        const v = trackW.value > 28 ? x.value / (trackW.value - 28) : 0;
        runOnJS(onChange)(v);
        runOnJS(triggerHaptic)();
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View onLayout={onLayout} style={styles.track}>
      <LinearGradient
        colors={
          [
            colors.secondaryMid,
            colors.primaryLight,
            colors.primaryMid,
            colors.primary,
          ] as unknown as readonly [string, string, ...string[]]
        }
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.trackGradient}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle, shadows.chip]} />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 28,
    borderRadius: radii.pill,
    justifyContent: 'center',
    overflow: 'visible',
  },
  trackGradient: {
    height: 10,
    borderRadius: radii.pill,
    marginTop: 9,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primaryMid,
  },
});
