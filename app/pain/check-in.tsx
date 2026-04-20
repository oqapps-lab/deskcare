import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { BgPattern } from '../../components/ui/BgPattern';
import { DecorativeArc } from '../../components/ui/DecorativeArc';
import { NavHeader } from '../../components/ui/NavHeader';
import { BodyPainMap, PainZone } from '../../components/ui/BodyPainMap';
import { GlassCard } from '../../components/ui/GlassCard';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { PillChip } from '../../components/ui/PillChip';
import { PillCTA } from '../../components/ui/PillCTA';
import { IconHalo } from '../../components/ui/IconHalo';
import { SeveritySlider } from '../../components/ui/SeveritySlider';
import type { GlyphName } from '../../components/ui/Glyph';
import type { HaloTone } from '../../components/ui/IconHalo';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

type SeverityLevel = 'mild' | 'moderate' | 'severe';

interface ZoneDef {
  id: PainZone;
  label: string;
  icon: GlyphName;
  tone: HaloTone;
}

const ZONES: ReadonlyArray<ZoneDef> = [
  { id: 'neck', label: 'Neck', icon: 'infinity', tone: 'coral' },
  { id: 'leftShoulder', label: 'Shoulders', icon: 'plus', tone: 'peach' },
  { id: 'chest', label: 'Upper back', icon: 'plus', tone: 'lavender' },
  { id: 'lowerBack', label: 'Lower back', icon: 'plus', tone: 'mint' },
];

/**
 * Pain Check-in — user selects zones on body, sets severity, picks label.
 * Demo flow continues to /sync on save.
 */
export default function PainCheckInScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const [selectedZones, setSelectedZones] = useState<Set<PainZone>>(
    new Set<PainZone>(['neck']),
  );
  const [severityPct, setSeverityPct] = useState(0.4);
  const [level, setLevel] = useState<SeverityLevel>('moderate');

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 420 });
    contentY.value = withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) });
    ctaOpacity.value = withDelay(reduceMotion ? 0 : 400, withTiming(1, { duration: 400 }));
  }, [reduceMotion, contentOpacity, contentY, ctaOpacity]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  const toggleZone = (z: PainZone) => {
    Haptics.selectionAsync();
    const next = new Set(selectedZones);
    if (next.has(z)) next.delete(z);
    else next.add(z);
    setSelectedZones(next);
  };

  const save = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/sync');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={240} opacity={0.20} />
      <DecorativeArc position="bottom-left" tone="lavender" size={200} opacity={0.15} />

      <NavHeader title="How do you feel?" onBack={back} />

      <Animated.View style={[styles.wrap, contentStyle]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + 180,
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Where does it hurt?</Text>
          <Text style={styles.subtitle}>
            Tap the areas of discomfort — we'll tailor your routine
          </Text>

          {/* Zone selector chips with IconHalo */}
          <View style={styles.zonesScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.zonesRow}
            >
              {ZONES.map((z) => {
                const active = selectedZones.has(z.id);
                return (
                  <ZoneTile
                    key={z.id}
                    label={z.label}
                    icon={z.icon}
                    tone={z.tone}
                    active={active}
                    onPress={() => toggleZone(z.id)}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* Body map */}
          <View style={styles.mapWrap}>
            <GlassCard
              tint="cream"
              radius="xl"
              padding={spacing.lg}
              innerGradient={false}
            >
              <View style={styles.mapInner}>
                <BodyPainMap
                  painZones={Array.from(selectedZones)}
                  width={220}
                  height={300}
                />
              </View>
            </GlassCard>
          </View>

          {/* Severity slider */}
          <GlassCard
            tint="peach"
            radius="xl"
            padding={spacing.xl}
            innerGradient
            decorativeCorner
          >
            <View style={styles.severityHeader}>
              <Eyebrow>INTENSITY</Eyebrow>
              <Text style={styles.severityValue}>
                {Math.round(severityPct * 10)}/10
              </Text>
            </View>
            <View style={{ height: spacing.md }} />
            <SeveritySlider value={severityPct} onChange={setSeverityPct} />
            <View style={{ height: spacing.sm }} />
            <View style={styles.severityLabels}>
              <Text style={styles.severityLabelEnd}>No pain</Text>
              <Text style={styles.severityLabelEnd}>Sharp</Text>
            </View>
          </GlassCard>

          <View style={{ height: spacing.lg }} />

          <View style={styles.eyebrowRow}>
            <Eyebrow>DESCRIBE IT</Eyebrow>
          </View>

          <View style={styles.chipColumn}>
            <PillChip
              active={level === 'mild'}
              onPress={() => setLevel('mild')}
              icon={level === 'mild' ? 'check' : undefined}
            >
              Mild discomfort
            </PillChip>
            <PillChip
              active={level === 'moderate'}
              icon={level === 'moderate' ? 'check' : undefined}
              onPress={() => setLevel('moderate')}
            >
              Moderate pain
            </PillChip>
            <PillChip
              active={level === 'severe'}
              onPress={() => setLevel('severe')}
              icon={level === 'severe' ? 'check' : undefined}
            >
              Sharp, hard to work through
            </PillChip>
          </View>
        </ScrollView>

        <Animated.View
          style={[
            styles.ctaFloating,
            ctaStyle,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <PillCTA
            variant="primary"
            size="lg"
            icon="check"
            iconBg
            breath
            onPress={save}
          >
            Save & continue
          </PillCTA>
        </Animated.View>
      </Animated.View>
    </AtmosphericBackground>
  );
}

interface ZoneTileProps {
  label: string;
  icon: GlyphName;
  tone: HaloTone;
  active: boolean;
  onPress: () => void;
}

const ZoneTile: React.FC<ZoneTileProps> = ({ label, icon, tone, active, onPress }) => (
  <View style={tileStyles.wrap}>
    <View
      style={[
        tileStyles.btn,
        active && tileStyles.btnActive,
      ]}
      onTouchEnd={onPress}
    >
      <IconHalo
        icon={icon}
        size="md"
        tone={tone}
        variant={active ? 'gradient' : 'tinted'}
        glow={active}
      />
      <Text style={[tileStyles.label, active && tileStyles.labelActive]}>
        {label}
      </Text>
    </View>
  </View>
);

const tileStyles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xs,
  },
  btn: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    gap: spacing.xs,
    minWidth: 88,
  },
  btnActive: {
    backgroundColor: colors.surfaceCard,
    ...shadows.soft,
  },
  label: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  labelActive: {
    color: colors.ink,
  },
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  zonesScrollWrap: {
    marginHorizontal: -spacing.xxl,
    marginBottom: spacing.xl,
  },
  zonesRow: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    alignItems: 'center',
  },
  mapWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mapInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  severityValue: {
    ...typeScale.headlineSm,
    color: colors.primary,
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityLabelEnd: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
  },
  eyebrowRow: {
    marginBottom: spacing.md,
  },
  chipColumn: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
});
