import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  NavHeader,
  PillCTA,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

const EXERCISES = [
  { name: 'Chin Tuck',          dur: '2 MIN',  pose: 'neck-roll' as const },
  { name: 'Upper Trap Stretch', dur: '2 MIN',  pose: 'neck-roll' as const },
  { name: 'Levator Release',    dur: '1 MIN',  pose: 'neck-roll' as const },
];

export default function RoutinePreviewScreen() {
  const insets = useSafeAreaInsets();
  const total = EXERCISES.reduce((acc, e) => acc + parseInt(e.dur, 10) * (e.dur.includes('SEC') ? 1 : 60), 0);
  const totalMin = Math.round(total / 60);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const begin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/exercise/player');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.20} />

      <NavHeader onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow variant="accent">TODAY'S ROUTINE</Eyebrow>
        <Text style={styles.title}>Neck Unwind</Text>
        <Text style={styles.sub}>Three gentle moves that release the sub-occipitals.</Text>

        <View style={styles.heroWrap}>
          <VideoPlaceholder pose="neck-roll" width={320} height={200} />
        </View>

        <View style={styles.statsRow}>
          <StatCol value={`${totalMin}`} unit="MIN" />
          <Sep />
          <StatCol value={`${EXERCISES.length}`} unit="MOVES" />
          <Sep />
          <StatCol value="NECK" unit="FOCUS" />
        </View>

        <Eyebrow>WHAT YOU'LL DO</Eyebrow>
        <View style={styles.list}>
          {EXERCISES.map((e, i) => (
            <View key={e.name} style={styles.row}>
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{i + 1}</Text>
              </View>
              <VideoPlaceholder pose={e.pose} compact />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{e.name}</Text>
                <Text style={styles.rowMeta}>{e.dur}</Text>
              </View>
            </View>
          ))}
        </View>

        <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
          <Text style={styles.tipTitle}>Before you start</Text>
          <Text style={styles.tipBody}>
            Soften your shoulders. Breathe slowly through the nose. Stop at the
            first hint of sharp pain.
          </Text>
        </GlassCard>
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <PillCTA variant="primary" size="lg" icon="play" iconBg breath onPress={begin}>
          Begin · {totalMin} min
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const StatCol: React.FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <View style={styles.statCol}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statUnit}>{unit}</Text>
  </View>
);

const Sep = () => <View style={styles.sep} />;

const styles = StyleSheet.create({
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
    letterSpacing: -0.5,
  },
  statUnit: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sep: {
    width: 1,
    height: 28,
    backgroundColor: colors.inkHairline,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: {
    ...typeScale.labelSm,
    color: colors.white,
    fontFamily: typeScale.titleLg.fontFamily,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  rowMeta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tipTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  tipBody: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
    backgroundColor: 'rgba(251,249,245,0.95)',
  },
});
