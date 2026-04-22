import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

const EXERCISES: Record<
  string,
  { name: string; meta: string; pose: 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch'; desc: string }
> = {
  'chin-tuck': {
    name: 'Chin Tuck',
    meta: '2 MIN · NECK · GENTLE',
    pose: 'neck-roll',
    desc: 'Pulls the head back into alignment. Releases the sub-occipital muscles that tighten from forward-screen posture.',
  },
  'upper-trap': {
    name: 'Upper Trap Stretch',
    meta: '2 MIN · NECK · GENTLE',
    pose: 'neck-roll',
    desc: 'A gentle side-bend with the opposite arm anchored. Lengthens the upper trapezius — the muscle that holds your shrug.',
  },
  'eye-figure-8': {
    name: 'Eye Figure-8',
    meta: '30 SEC · EYES · MEDITATIVE',
    pose: 'eye-rest',
    desc: 'Track an imaginary figure-8 with your eyes. Re-teaches the smooth-pursuit muscles that lock when staring at a monitor.',
  },
  'cat-cow': {
    name: 'Seated Cat-Cow',
    meta: '3 MIN · BACK · GENTLE',
    pose: 'back-arch',
    desc: 'From a seated posture, inhale-arch and exhale-round. Mobilizes every vertebra of your thoracic spine without leaving the chair.',
  },
  'wrist-flex': {
    name: 'Wrist Flex & Extend',
    meta: '2 MIN · WRISTS · GENTLE',
    pose: 'wrist-stretch',
    desc: 'Slow wrist flexion and extension with one arm at a time. Keeps the carpal tunnel from tightening around the median nerve.',
  },
  'thoracic-open': {
    name: 'Thoracic Opener',
    meta: '3 MIN · BACK · MODERATE',
    pose: 'back-arch',
    desc: 'A tabletop reach that rotates the mid-back. Relieves the rounded-shoulder slump that grows through the day.',
  },
  'palming': {
    name: 'Palming Reset',
    meta: '30 SEC · EYES · CALMING',
    pose: 'eye-rest',
    desc: 'Cup your palms over closed eyes. A 30-second blackout that gives the retina its first real break of the day.',
  },
  'levator': {
    name: 'Levator Scapulae Release',
    meta: '5 MIN · NECK · MODERATE',
    pose: 'neck-roll',
    desc: 'A deeper release for the muscle that connects neck to shoulder blade. Best when neck pain has been daily for weeks.',
  },
  'median-glide': {
    name: 'Median Nerve Glide',
    meta: '2 MIN · WRISTS · MODERATE',
    pose: 'wrist-stretch',
    desc: 'A small arm-sweep that slides the median nerve through the carpal tunnel. Essential in carpal-tunnel care.',
  },
};

const TARGETS = 'Deep neck flexors, sub-occipitals';
const AVOID = 'Recent neck injury or whiplash';
const MODIFY = 'Sit with back fully supported; stop if dizzy.';

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exerciseId?: string; locked?: string }>();
  const exercise = EXERCISES[(params.exerciseId as string) ?? 'chin-tuck'] ?? EXERCISES['chin-tuck'];
  const locked = params.locked === '1';

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const begin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/exercise/preview');
  };
  const unlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding/paywall');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.thumbWrap, locked && styles.thumbLocked]}>
          <VideoPlaceholder pose={exercise.pose} width={320} height={240} showPlay={!locked} />
          {locked && (
            <View style={styles.lockOverlay} pointerEvents="none">
              <View style={styles.lockChip}>
                <Svg width={18} height={18} viewBox="0 0 18 18">
                  <Path d="M5 9 L13 9 L13 14 L5 14 Z M7 9 L7 6 Q7 3 9 3 Q11 3 11 6 L11 9" stroke={colors.primaryMid} strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </Svg>
                <Text style={styles.lockChipText}>Premium</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={[styles.name, locked && styles.nameLocked]}>{exercise.name}</Text>
        <Text style={styles.meta}>{exercise.meta}</Text>

        <Text style={styles.desc}>{exercise.desc}</Text>

        <View style={styles.sections}>
          <View style={styles.section}>
            <Eyebrow>TARGETS</Eyebrow>
            <Text style={styles.sectionBody}>{TARGETS}</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.section}>
            <Eyebrow>AVOID IF</Eyebrow>
            <Text style={styles.sectionBody}>{AVOID}</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.section}>
            <Eyebrow>MODIFY</Eyebrow>
            <Text style={styles.sectionBody}>{MODIFY}</Text>
          </View>
        </View>

        {!locked && (
          <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
            <View style={styles.tipRow}>
              <Text style={styles.tipTitle}>Coming soon</Text>
              <Text style={styles.tipBody}>
                Real video shoots are in production — once they land you'll see the guided video right here.
              </Text>
            </View>
          </GlassCard>
        )}
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        {locked ? (
          <>
            <PillCTA variant="primary" size="lg" breath onPress={unlock}>
              Unlock with 7-day free trial
            </PillCTA>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/onboarding/paywall');
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="See what's included"
              style={{ marginTop: spacing.sm }}
            >
              <Text style={styles.seeLink}>See what's included</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.beginRow}>
            <View style={styles.heartSlot}>
              <Svg width={22} height={22} viewBox="0 0 20 20">
                <Path
                  d="M10 17 C 3 12 1 9 3 6 C 5 3 8.5 4 10 7 C 11.5 4 15 3 17 6 C 19 9 17 12 10 17 Z"
                  stroke={colors.primaryMid}
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <PillCTA variant="primary" size="lg" icon="play" iconBg breath onPress={begin}>
                Begin
              </PillCTA>
            </View>
          </View>
        )}
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  thumbWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  thumbLocked: {
    opacity: 0.88,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  lockChipText: {
    ...typeScale.label,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
  },
  name: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  nameLocked: {
    color: colors.inkMuted,
  },
  meta: {
    ...typeScale.label,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  desc: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  sections: {
    marginBottom: spacing.xl,
  },
  section: {
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.inkHairline,
  },
  sectionBody: {
    ...typeScale.body,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  tipRow: {
    gap: spacing.xs,
  },
  tipTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  tipBody: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
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
  beginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  heartSlot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeLink: {
    ...typeScale.bodySm,
    color: colors.primaryMid,
  },
});
