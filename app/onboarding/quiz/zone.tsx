import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  NavHeader,
  PillChip,
  PillCTA,
  ProgressBar,
  QuizTile,
} from '../../../components/ui';
import { colors, spacing, typeScale } from '../../../constants/tokens';
import { useOnboarding } from '../../../lib/store/onboarding';

type Zone = 'neck' | 'back' | 'eyes' | 'wrists';

const TILES: ReadonlyArray<{
  id: Zone;
  label: string;
  tone: 'coral' | 'peach' | 'lavender' | 'mint';
  tint: 'coral' | 'peach' | 'lavender' | 'mint';
  icon: React.ReactNode;
}> = [
  { id: 'neck',   label: 'Neck',            tone: 'coral',    tint: 'coral',    icon: <NeckIcon /> },
  { id: 'back',   label: 'Back & lower',    tone: 'peach',    tint: 'peach',    icon: <BackIcon /> },
  { id: 'eyes',   label: 'Eyes',            tone: 'lavender', tint: 'lavender', icon: <EyesIcon /> },
  { id: 'wrists', label: 'Wrists',          tone: 'mint',     tint: 'mint',     icon: <WristIcon /> },
];

export default function QuizZoneScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<Set<Zone>>(new Set());
  const [everything, setEverything] = useState(false);
  const setZones = useOnboarding((s) => s.setZones);

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 440 });
    contentY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    ctaOpacity.value = withDelay(reduceMotion ? 0 : 320, withTiming(1, { duration: 420 }));
  }, [reduceMotion, contentOpacity, contentY, ctaOpacity]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const toggle = (z: Zone) => {
    const next = new Set(selected);
    if (next.has(z)) next.delete(z);
    else next.add(z);
    setSelected(next);
    setEverything(false);
  };
  const toggleEverything = () => {
    const v = !everything;
    setEverything(v);
    setSelected(v ? new Set<Zone>(['neck', 'back', 'eyes', 'wrists']) : new Set());
  };

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const next = () => {
    if (selected.size === 0 && !everything) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setZones(everything ? ['neck', 'back', 'eyes', 'wrists'] : Array.from(selected));
    router.push('/onboarding/quiz/frequency');
  };
  const skip = () => {
    Haptics.selectionAsync();
    setZones([]);
    router.push('/onboarding/quiz/frequency');
  };

  const hasAny = selected.size > 0 || everything;

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader onBack={back} />

      <Animated.View style={[styles.root, contentStyle, { paddingBottom: insets.bottom + 160 }]}>
        <View style={styles.progressBlock}>
          <Eyebrow>STEP 1 OF 4</Eyebrow>
          <View style={{ height: spacing.sm }} />
          <ProgressBar value={0.25} accessibilityLabel="Quiz progress: step 1 of 4" />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>Where does it{'\n'}hurt most?</Text>
          <Text style={styles.sub}>You can choose more than one.</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            {TILES.slice(0, 2).map((t) => (
              <QuizTile
                key={t.id}
                label={t.label}
                icon="plus"
                customIcon={t.icon}
                tone={t.tone}
                tint={t.tint}
                active={selected.has(t.id)}
                onPress={() => toggle(t.id)}
              />
            ))}
          </View>
          <View style={styles.gridRow}>
            {TILES.slice(2, 4).map((t) => (
              <QuizTile
                key={t.id}
                label={t.label}
                icon="plus"
                customIcon={t.icon}
                tone={t.tone}
                tint={t.tint}
                active={selected.has(t.id)}
                onPress={() => toggle(t.id)}
              />
            ))}
          </View>
          <View style={styles.everythingRow}>
            <PillChip active={everything} onPress={toggleEverything} size="md">
              Everything, honestly
            </PillChip>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.ctaFloating, ctaStyle, { paddingBottom: insets.bottom + spacing.md }]}
        pointerEvents="box-none"
      >
        <PillCTA
          variant="primary"
          size="lg"
          onPress={next}
          disabled={!hasAny}
          breath={hasAny}
          accessibilityLabel={hasAny ? 'Next step' : 'Pick at least one zone'}
        >
          Next
        </PillCTA>
        <View style={{ height: spacing.sm }} />
        <Text style={styles.skip} onPress={skip}>
          Skip for now
        </Text>
      </Animated.View>
    </AtmosphericBackground>
  );
}

/* ---- Inline body-part SVG icons, 28x28
 *
 * Polished pass: consistent 2.0–2.4 stroke weights, rounded caps, no stray
 * dots. Each icon reads as a clean pictogram instead of a hand-drawn sketch.
 */

function NeckIcon() {
  return (
    <View style={iconStyles.chip}>
      <Svg width={28} height={28} viewBox="0 0 28 28">
        {/* head */}
        <Circle cx="14" cy="8" r="4.5" stroke={colors.primaryMid} strokeWidth="2" fill="none" />
        {/* neck */}
        <Path
          d="M12 13 L12 16 M16 13 L16 16"
          stroke={colors.primaryMid}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* shoulders */}
        <Path
          d="M5 22 Q14 17 23 22"
          stroke={colors.primaryMid}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

function BackIcon() {
  return (
    <View style={iconStyles.chip}>
      <Svg width={28} height={28} viewBox="0 0 28 28">
        {/* gentle S-curve spine */}
        <Path
          d="M14 3 Q10 8 14 13 Q18 18 14 23"
          stroke={colors.primaryMid}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* vertebra accents */}
        <Circle cx="14" cy="6" r="1.6" fill={colors.primaryMid} />
        <Circle cx="14" cy="14" r="1.6" fill={colors.primaryMid} />
        <Circle cx="14" cy="22" r="1.6" fill={colors.primaryMid} />
      </Svg>
    </View>
  );
}

function EyesIcon() {
  return (
    <View style={iconStyles.chip}>
      <Svg width={28} height={28} viewBox="0 0 28 28">
        {/* eye lens */}
        <Path
          d="M3 14 Q14 6 25 14 Q14 22 3 14 Z"
          stroke={colors.tertiaryMid}
          strokeWidth="2.2"
          fill="none"
        />
        {/* iris ring (not solid disc — matches Eye Session polish) */}
        <Circle
          cx="14"
          cy="14"
          r="3.4"
          stroke={colors.tertiaryMid}
          strokeWidth="1.8"
          fill="none"
        />
        {/* pupil dot */}
        <Circle cx="14" cy="14" r="1.2" fill={colors.tertiaryMid} />
      </Svg>
    </View>
  );
}

function WristIcon() {
  return (
    <View style={iconStyles.chip}>
      <Svg width={28} height={28} viewBox="0 0 28 28">
        {/* forearm */}
        <Path
          d="M3 14 L11 14"
          stroke={colors.mintMid}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* wrist joint */}
        <Circle
          cx="12"
          cy="14"
          r="2.6"
          stroke={colors.mintMid}
          strokeWidth="2"
          fill="none"
        />
        {/* 3 fingers */}
        <Path
          d="M16 14 L23 14 M17 10 L22 10 M17 18 L22 18"
          stroke={colors.mintMid}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  chip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  progressBlock: {
    marginBottom: spacing.xl,
  },
  copy: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  grid: {
    gap: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  everythingRow: {
    marginTop: spacing.sm,
    alignItems: 'stretch',
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
  skip: {
    ...typeScale.title,
    color: colors.primaryMid,
    textAlign: 'center',
  },
});
