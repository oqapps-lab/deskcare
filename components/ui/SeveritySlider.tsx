import React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows } from '../../constants/tokens';

interface Props {
  value: number; // 0..1
  onChange?: (v: number) => void;
}

const THUMB = 28;

/**
 * Warm gradient slider for pain severity. Track fades cream → coral → deep.
 *
 * The whole track is the touch target — tap anywhere to snap the thumb,
 * drag continues from the touch position. Parent receives live updates
 * during drag (rounded to 1/10 to avoid render storms) plus a final
 * settle at touch-end. Track-width changes (rotation, parent layout)
 * resync the thumb without animation jumps.
 */
export const SeveritySlider: React.FC<Props> = ({ value, onChange }) => {
  const trackW = useSharedValue(0);
  const x = useSharedValue(0);
  const lastReported = useSharedValue(-1);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackW.value = w;
    x.value = value * (w - THUMB);
  };

  // External value prop → thumb position (e.g. parent resets to 0).
  useAnimatedReaction(
    () => ({ v: value, w: trackW.value }),
    ({ v, w }) => {
      if (w <= THUMB) return;
      // Only sync from props when the value is materially different from
      // the in-flight gesture position. Avoids tug-of-war while dragging.
      const target = v * (w - THUMB);
      if (Math.abs(target - x.value) > 0.5) {
        x.value = target;
      }
    },
    [value],
  );

  const emit = (v: number) => {
    if (onChange) onChange(v);
  };
  const triggerHaptic = () => {
    void Haptics.selectionAsync();
  };

  const reportThrottled = (v: number) => {
    'worklet';
    const rounded = Math.round(v * 10) / 10;
    if (rounded !== lastReported.value) {
      lastReported.value = rounded;
      runOnJS(emit)(rounded);
    }
  };

  const pan = Gesture.Pan()
    .minDistance(0) // activate on touch — no swipe threshold
    .onBegin((e) => {
      const next = Math.min(Math.max(0, e.x - THUMB / 2), trackW.value - THUMB);
      x.value = next;
      if (trackW.value > THUMB) reportThrottled(next / (trackW.value - THUMB));
    })
    .onUpdate((e) => {
      const next = Math.min(Math.max(0, e.x - THUMB / 2), trackW.value - THUMB);
      x.value = next;
      if (trackW.value > THUMB) reportThrottled(next / (trackW.value - THUMB));
    })
    .onEnd(() => {
      if (trackW.value > THUMB) {
        const v = x.value / (trackW.value - THUMB);
        runOnJS(emit)(v);
      }
      runOnJS(triggerHaptic)();
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
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
          pointerEvents="none"
        />
        <Animated.View style={[styles.thumb, thumbStyle, shadows.chip]} pointerEvents="none" />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 44, // wider hit area for finger-friendly tapping
    justifyContent: 'center',
    overflow: 'visible',
  },
  trackGradient: {
    height: 10,
    borderRadius: radii.pill,
    marginTop: 17, // (44 - 10) / 2 = 17 to center
  },
  thumb: {
    position: 'absolute',
    top: 8, // (44 - 28) / 2 = 8 to center vertically
    width: THUMB,
    height: THUMB,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primaryMid,
  },
});
