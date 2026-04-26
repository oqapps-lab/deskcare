import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  FloatingScrim,
  GlassCard,
  NavHeader,
  PillCTA,
  VideoPlaceholder,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import type { Exercise } from '../../lib/types/db';

const poseFor = (code: string | undefined): 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch' => {
  if (!code) return 'neck-roll';
  if (code.startsWith('N')) return 'neck-roll';
  if (code.startsWith('B') || code.startsWith('S') || code.startsWith('F')) return 'back-arch';
  if (code.startsWith('W')) return 'wrist-stretch';
  if (code.startsWith('E')) return 'eye-rest';
  return 'neck-roll';
};

const formatDuration = (s: number): string => (s < 60 ? `${s} SEC` : `${Math.round(s / 60)} MIN`);
const difficultyLabel = (d: 1 | 2 | 3): string => (d === 1 ? 'GENTLE' : d === 2 ? 'MODERATE' : 'ADVANCED');

const useExercise = (slug: string | undefined) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from('exercises')
      .select(
        'id, code, slug, title, title_en, description, video_url, thumbnail_url, duration_seconds, reps_inside_atom, difficulty, exercise_type, is_premium, cautions, modifications',
      )
      .eq('slug', slug)
      .single()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) setError(e.message);
        else setExercise(data as Exercise);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { exercise, loading, error };
};

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exerciseId?: string; locked?: string }>();
  const { exercise, loading, error } = useExercise(params.exerciseId as string | undefined);
  const locked = params.locked === '1' || !!exercise?.is_premium;

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
        {loading && !exercise ? (
          <View style={styles.statusWrap}>
            <ActivityIndicator color={colors.primaryMid} />
          </View>
        ) : error || !exercise ? (
          <View style={styles.statusWrap}>
            <Text style={styles.statusError}>
              {error ? `Could not load exercise: ${error}` : 'Exercise not found.'}
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.thumbWrap, locked && styles.thumbLocked]}>
              <VideoPlaceholder
                pose={poseFor(exercise.code)}
                width={320}
                height={240}
                showPlay={!locked}
              />
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

            <Text style={[styles.name, locked && styles.nameLocked]}>{exercise.title}</Text>
            <Text style={styles.meta}>
              {exercise.code} · {formatDuration(exercise.duration_seconds)} · {exercise.exercise_type.toUpperCase()} · {difficultyLabel(exercise.difficulty)}
            </Text>

            {exercise.description && <Text style={styles.desc}>{exercise.description}</Text>}

            <View style={styles.sections}>
              {exercise.reps_inside_atom && (
                <>
                  <View style={styles.section}>
                    <Eyebrow>REPETITIONS PER ATOM</Eyebrow>
                    <Text style={styles.sectionBody}>{exercise.reps_inside_atom}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </>
              )}
              {exercise.cautions && (
                <>
                  <View style={styles.section}>
                    <Eyebrow>CAUTIONS</Eyebrow>
                    <Text style={styles.sectionBody}>{exercise.cautions}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </>
              )}
              {exercise.modifications && (
                <>
                  <View style={styles.section}>
                    <Eyebrow>MODIFY</Eyebrow>
                    <Text style={styles.sectionBody}>{exercise.modifications}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </>
              )}
              {exercise.title_en && (
                <View style={styles.section}>
                  <Eyebrow>ENGLISH NAME</Eyebrow>
                  <Text style={styles.sectionBody}>{exercise.title_en}</Text>
                </View>
              )}
            </View>

            {!exercise.video_url && (
              <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
                <View style={styles.tipRow}>
                  <Text style={styles.tipTitle}>Coming soon</Text>
                  <Text style={styles.tipBody}>
                    Real video shoots are in production — once they land you'll see the guided video right here.
                  </Text>
                </View>
              </GlassCard>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
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
  statusWrap: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  statusError: {
    ...typeScale.bodySm,
    color: colors.error,
    textAlign: 'center',
  },
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
    paddingTop: spacing.huge,
    alignItems: 'center',
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
