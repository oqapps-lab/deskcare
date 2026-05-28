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
  ExerciseVideo,
  Eyebrow,
  FloatingScrim,
  GlassCard,
  NavHeader,
  PillCTA,
  PremiumLock,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useIsPremium } from '../../lib/premium';
import { supabase } from '../../lib/supabase';
import type { Exercise } from '../../lib/types/db';
import { t, i18nField } from '../../lib/i18n';

const poseFor = (code: string | undefined): 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch' => {
  if (!code) return 'neck-roll';
  if (code.startsWith('N')) return 'neck-roll';
  if (code.startsWith('B') || code.startsWith('S') || code.startsWith('F')) return 'back-arch';
  if (code.startsWith('W')) return 'wrist-stretch';
  if (code.startsWith('E')) return 'eye-rest';
  return 'neck-roll';
};

const formatDuration = (s: number): string => (s < 60 ? `${s} SEC` : `${Math.round(s / 60)} MIN`);
const difficultyLabel = (d: 1 | 2 | 3): string =>
  d === 1 ? t('libd_difficulty_gentle') : d === 2 ? t('libd_difficulty_moderate') : t('libd_difficulty_advanced');

const useExercise = (slug: string | undefined) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    supabase
      .from('exercises')
      .select(
        'id, code, slug, title, title_en, description, video_url, thumbnail_url, duration_seconds, reps_inside_atom, difficulty, exercise_type, is_premium, cautions, modifications',
      )
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) {
          if (e.code === 'PGRST116') setNotFound(true);
          else setError(e.message);
        } else if (!data) {
          setNotFound(true);
        } else {
          setExercise(data as Exercise);
        }
        setLoading(false);
      }, () => {
        // D1 fix: PromiseLike rejection (network down, offline) — without
        // this onRejected handler, loading state stayed true forever.
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { exercise, loading, notFound, error };
};

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exerciseId?: string; locked?: string }>();
  const { exercise, loading, notFound, error } = useExercise(params.exerciseId as string | undefined);
  const isPremium = useIsPremium();
  const locked = !isPremium && (params.locked === '1' || !!exercise?.is_premium);
  const [isFavorite, setIsFavorite] = useState(false);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/library');
  };
  const begin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Pass the exercise slug — player builds a synthetic 1-step routine
    // around it so users actually run THIS exercise, not the default neck
    // routine the previous parameter-less push fell into.
    if (!exercise) return;
    router.push({ pathname: '/exercise/player', params: { exercise: exercise.slug } } as never);
  };
  const unlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/onboarding/paywall');
  };
  const toggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite((v) => !v);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.18} />

      <NavHeader onBack={back} />

      <ScrollView
        removeClippedSubviews={true}
        scrollEventThrottle={16}
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
        ) : notFound ? (
          <View style={styles.statusWrap}>
            <Eyebrow variant="accent">{t('libd_not_found_eyebrow')}</Eyebrow>
            <Text style={styles.notFoundTitle}>{t('libd_not_found_title')}</Text>
            <Text style={styles.notFoundSub}>{t('libd_not_found_body')}</Text>
            <View style={{ height: spacing.lg }} />
            <PillCTA variant="primary" size="md" onPress={back}>
              {t('common_back')}
            </PillCTA>
          </View>
        ) : error || !exercise ? (
          <View style={styles.statusWrap}>
            <Eyebrow variant="accent">{t('libd_error_eyebrow')}</Eyebrow>
            <Text style={styles.notFoundTitle}>{t('libd_error_title')}</Text>
            <Text style={styles.notFoundSub}>{t('libd_error_body')}</Text>
            <View style={{ height: spacing.lg }} />
            <PillCTA variant="primary" size="md" onPress={back}>
              {t('common_back')}
            </PillCTA>
          </View>
        ) : (
          <>
            <View style={[styles.thumbWrap, locked && styles.thumbLocked]}>
              <ExerciseVideo
                pose={poseFor(exercise.code)}
                videoUrl={locked ? null : exercise.video_url}
                width={300}
                height={400}
                showPlay={!locked}
              />
              {locked && (
                <View style={styles.lockOverlay} pointerEvents="none">
                  <PremiumLock size="md" label={t('libd_premium_label')} />
                </View>
              )}
            </View>

            <Text style={[styles.name, locked && styles.nameLocked]}>{i18nField(exercise, 'title')}</Text>
            <Text style={styles.meta}>
              {exercise.code} · {formatDuration(exercise.duration_seconds)} · {exercise.exercise_type.toUpperCase()} · {difficultyLabel(exercise.difficulty)}
            </Text>

            {i18nField(exercise, 'description') && <Text style={styles.desc}>{i18nField(exercise, 'description')}</Text>}

            <View style={styles.sections}>
              {exercise.reps_inside_atom && (
                <>
                  <View style={styles.section}>
                    <Eyebrow>{t('libd_rep_label')}</Eyebrow>
                    <Text style={styles.sectionBody}>{exercise.reps_inside_atom}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </>
              )}
              {exercise.cautions && (
                <>
                  <View style={styles.section}>
                    <Eyebrow>{t('libd_caution_label')}</Eyebrow>
                    <Text style={styles.sectionBody}>{exercise.cautions}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </>
              )}
              {exercise.modifications && (
                <>
                  <View style={styles.section}>
                    <Eyebrow>{t('libd_modify_label')}</Eyebrow>
                    <Text style={styles.sectionBody}>{exercise.modifications}</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                </>
              )}
            </View>

            {!exercise.video_url && (
              <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
                <View style={styles.tipRow}>
                  <Text style={styles.tipTitle}>{t('libd_coming_soon_title')}</Text>
                  <Text style={styles.tipBody}>{t('libd_coming_soon_body')}</Text>
                </View>
              </GlassCard>
            )}
          </>
        )}
      </ScrollView>

      {/* Hide the floating CTA entirely on not-found / error states so users
          don't see a stray "Begin" button under the "This move isn't in our
          library" copy. */}
      {exercise && !notFound && !error && (
      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
        {locked ? (
          <>
            <PillCTA variant="primary" size="lg" breath onPress={unlock}>
              {t('libd_cta_unlock')}
            </PillCTA>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/onboarding/paywall');
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('libd_cta_seewhat')}
              style={{ marginTop: spacing.sm }}
            >
              <Text style={styles.seeLink}>{t('libd_cta_seewhat')}</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.beginRow}>
            <Pressable
              onPress={toggleFavorite}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityState={{ selected: isFavorite }}
              accessibilityLabel={isFavorite ? t('libd_fav_remove') : t('libd_fav_save')}
              style={({ pressed }) => [
                styles.heartSlot,
                isFavorite && styles.heartSlotActive,
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
            >
              <Svg width={22} height={22} viewBox="0 0 20 20">
                <Path
                  d="M10 17 C 3 12 1 9 3 6 C 5 3 8.5 4 10 7 C 11.5 4 15 3 17 6 C 19 9 17 12 10 17 Z"
                  stroke={isFavorite ? colors.primaryDeep : colors.primaryMid}
                  strokeWidth="1.6"
                  fill={isFavorite ? colors.primaryDeep : 'none'}
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
            <View style={{ flex: 1 }}>
              <PillCTA variant="primary" size="lg" icon="play" iconBg breath onPress={begin}>
                {t('libd_cta_begin')}
              </PillCTA>
            </View>
          </View>
        )}
      </View>
      )}
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
  notFoundTitle: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  notFoundSub: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
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
  heartSlotActive: {
    backgroundColor: colors.primaryLight,
  },
  seeLink: {
    ...typeScale.bodySm,
    color: colors.primaryMid,
  },
});
