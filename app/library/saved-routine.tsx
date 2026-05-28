import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { safeBack } from '../../lib/nav';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
import { useExercises } from '../../hooks/useContent';
import { useCustomRoutines } from '../../hooks/useCustomRoutines';
import { t, i18nField } from '../../lib/i18n';

const poseFor = (code: string): 'neck-roll' | 'back-arch' | 'eye-rest' | 'wrist-stretch' => {
  if (code.startsWith('N')) return 'neck-roll';
  if (code.startsWith('B') || code.startsWith('S') || code.startsWith('F')) return 'back-arch';
  if (code.startsWith('W')) return 'wrist-stretch';
  if (code.startsWith('E')) return 'eye-rest';
  return 'neck-roll';
};

export default function SavedRoutineScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { routines, remove } = useCustomRoutines();
  const { exercises } = useExercises('all');

  const routine = useMemo(() => routines.find((r) => r.id === params.id), [routines, params.id]);

  const items = useMemo(() => {
    if (!routine || !exercises) return [];
    return routine.exerciseSlugs
      .map((slug) => exercises.find((e) => e.slug === slug))
      .filter((e): e is NonNullable<typeof e> => !!e);
  }, [routine, exercises]);

  const totalSec = useMemo(() => items.reduce((acc, e) => acc + (e.duration_seconds || 0), 0), [items]);

  const start = () => {
    if (items.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Start with the first exercise's preview — player handles the sequence param.
    router.push({
      pathname: '/exercise/preview',
      params: { exercise: items[0].slug, source: 'custom', routineId: routine?.id },
    } as never);
  };

  const onDelete = () => {
    if (!routine) return;
    Alert.alert(
      t('cr_delete_title'),
      t('cr_delete_body', { name: routine.name }),
      [
        { text: t('common_cancel'), style: 'cancel' },
        {
          text: t('cr_delete_confirm'),
          style: 'destructive',
          onPress: async () => {
            await remove(routine.id);
            safeBack('/main/library');
          },
        },
      ],
    );
  };

  if (!routine) {
    return (
      <AtmosphericBackground>
        <NavHeader title="" onBack={() => safeBack('/main/library')} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.huge }}>
          <Text style={{ ...typeScale.body, color: colors.inkMuted, textAlign: 'center' }}>
            {t('cr_not_found')}
          </Text>
        </View>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="lavender" size={220} opacity={0.18} />

      <NavHeader title={routine.name} onBack={() => safeBack('/main/library')} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 200,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(280)}>
          <GlassCard tint="lavender" radius="xl" padding={spacing.xl} innerGradient>
            <Eyebrow variant="accent">{t('cr_hero_eyebrow')}</Eyebrow>
            <Text style={styles.heroTitle}>{routine.name}</Text>
            <Text style={styles.heroMeta}>
              {t('cr_hero_meta', {
                count: items.length,
                min: Math.max(1, Math.round(totalSec / 60)),
              })}
            </Text>
          </GlassCard>
        </Animated.View>

        <Eyebrow style={{ marginTop: spacing.xl }}>{t('cr_exercises_eyebrow')}</Eyebrow>

        {items.map((e, i) => (
          <Animated.View key={e.id} entering={FadeInDown.delay(60 + i * 50).duration(260)}>
            <View style={styles.exRow}>
              <VideoPlaceholder pose={poseFor(e.code)} circle />
              <View style={styles.exText}>
                <Text style={styles.exName} numberOfLines={2}>{i18nField(e, 'title')}</Text>
                <Text style={styles.exMeta}>
                  {e.code} · {Math.max(1, Math.round((e.duration_seconds || 0) / 60))} MIN
                </Text>
              </View>
              <Text style={styles.exOrder}>{i + 1}</Text>
            </View>
          </Animated.View>
        ))}

        <Pressable onPress={onDelete} accessibilityRole="button" style={({ pressed }) => [pressed && styles.pressed, styles.deleteRow]}>
          <Text style={styles.deleteText}>{t('cr_delete_action')}</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
        <PillCTA variant="primary" size="lg" icon="play" iconBg breath onPress={start} disabled={items.length === 0}>
          {t('cr_cta_start')}
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  heroTitle: { ...typeScale.headlineSm, color: colors.ink, marginTop: spacing.sm },
  heroMeta: { ...typeScale.labelSm, color: colors.primaryDeep, textTransform: 'uppercase', marginTop: spacing.sm },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inkHairline,
  },
  exText: { flex: 1, minWidth: 0 },
  exName: { ...typeScale.title, color: colors.ink },
  exMeta: { ...typeScale.bodySm, color: colors.inkSubtle, marginTop: 2 },
  exOrder: { ...typeScale.title, color: colors.inkSubtle },
  pressed: { opacity: 0.8 },
  deleteRow: { marginTop: spacing.xl, alignItems: 'center', paddingVertical: spacing.md },
  deleteText: { ...typeScale.bodySm, color: colors.inkSubtle },
  ctaFloating: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
});
