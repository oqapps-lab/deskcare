import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { getStory, type StoryTone } from '../../lib/stories';

const PAGE_MS = 6500;

const TONE_GRADIENT: Record<StoryTone, [string, string]> = {
  coral: ['#7E2C03', '#E87B4E'],
  lavender: ['#3E3457', '#9B8EB4'],
  mint: ['#2F5C46', '#6BA485'],
  peach: ['#8A3D12', '#FFB599'],
  sky: ['#234E5E', '#5B8CA0'],
};

export default function StoryViewerScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(String(id));
  const [page, setPage] = useState(0);

  const close = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  // Guard: unknown id → bounce home.
  useEffect(() => {
    if (!story) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story]);

  if (!story) return <View style={styles.root} />;

  const total = story.pages.length;
  const next = () => {
    Haptics.selectionAsync();
    if (page < total - 1) setPage((p) => p + 1);
    else close();
  };
  const prev = () => {
    Haptics.selectionAsync();
    if (page > 0) setPage((p) => p - 1);
  };

  const current = story.pages[page];
  const [top, bottom] = TONE_GRADIENT[story.tone];

  return (
    <View style={styles.root}>
      <LinearGradient colors={[top, bottom]} style={StyleSheet.absoluteFill} />

      {/* Progress bars */}
      <View style={[styles.progressRow, { top: insets.top + spacing.sm }]}>
        {story.pages.map((_, i) => (
          <ProgressBar
            key={i}
            active={i === page}
            filled={i < page}
            durationMs={reduceMotion ? 0 : PAGE_MS}
            onDone={next}
          />
        ))}
      </View>

      {/* Header: glyph label + close */}
      <View style={[styles.header, { top: insets.top + spacing.xl }]}>
        <Text style={styles.headerLabel}>{story.label}</Text>
        <Pressable onPress={close} hitSlop={14} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>{current.heading}</Text>
        <Text style={styles.body}>{current.body}</Text>
        {current.takeaway ? (
          <View style={styles.takeawayWrap}>
            <Text style={styles.takeaway}>{current.takeaway}</Text>
          </View>
        ) : null}
      </View>

      {/* Tap zones: left third = prev, right = next */}
      <View style={styles.tapRow} pointerEvents="box-none">
        <Pressable style={styles.tapPrev} onPress={prev} accessibilityLabel="Previous" />
        <Pressable style={styles.tapNext} onPress={next} accessibilityLabel="Next" />
      </View>
    </View>
  );
}

/** A single progress bar that fills over durationMs while active, then
 *  calls onDone. filled bars are solid; future bars are dim. */
const ProgressBar: React.FC<{
  active: boolean;
  filled: boolean;
  durationMs: number;
  onDone: () => void;
}> = ({ active, filled, durationMs, onDone }) => {
  const w = useSharedValue(filled ? 1 : 0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (filled) {
      w.value = 1;
      return;
    }
    if (!active) {
      w.value = 0;
      return;
    }
    w.value = 0;
    if (durationMs <= 0) {
      w.value = 1;
      return;
    }
    w.value = withTiming(1, { duration: durationMs, easing: Easing.linear });
    const t = setTimeout(() => doneRef.current(), durationMs);
    return () => clearTimeout(t);
  }, [active, filled, durationMs, w]);

  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, style]} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryDeep,
  },
  progressRow: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLabel: {
    ...typeScale.label,
    color: 'rgba(255,255,255,0.92)',
    textTransform: 'uppercase',
  },
  close: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  heading: {
    ...typeScale.display,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  body: {
    ...typeScale.titleLg,
    color: 'rgba(255,255,255,0.94)',
    lineHeight: 30,
    fontWeight: '400',
  },
  takeawayWrap: {
    marginTop: spacing.xxl,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  takeaway: {
    ...typeScale.title,
    color: '#fff',
  },
  tapRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  tapPrev: {
    width: '32%',
  },
  tapNext: {
    flex: 1,
  },
});
