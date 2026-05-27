import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  GlassCard,
  IconHalo,
  NavHeader,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { COACH_ZONES, type CoachOption, type CoachZone } from '../../lib/coach';
import { t } from '../../lib/i18n';

type Step = 'pick_zone' | 'pick_option' | 'show_result';

export default function PainCoachScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('pick_zone');
  const [zone, setZone] = useState<CoachZone | null>(null);
  const [option, setOption] = useState<CoachOption | null>(null);

  const pickZone = (z: CoachZone) => {
    Haptics.selectionAsync();
    setZone(z);
    setStep('pick_option');
  };
  const pickOption = (o: CoachOption) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOption(o);
    setStep('show_result');
  };
  const back = () => {
    if (step === 'show_result') {
      setStep('pick_option');
      setOption(null);
    } else if (step === 'pick_option') {
      setStep('pick_zone');
      setZone(null);
    } else {
      router.back();
    }
  };
  const startRoutine = () => {
    if (!option) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/exercise/preview', params: { routine: option.routineSlug } } as never);
  };
  const openArticle = (slug: string) => {
    Haptics.selectionAsync();
    router.push(`/knowledge/${slug}` as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.16} />

      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <NavHeader showBack onBack={back} title="" />

        <Text style={styles.eyebrow}>{t('coach_eyebrow')}</Text>
        <Text style={styles.title}>
          {step === 'pick_zone' ? t('coach_step1_title') :
           step === 'pick_option' ? zone?.followUp ?? '' :
           option?.redFlag ? option.redFlag.title : t('coach_step3_title_default')}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.huge, paddingTop: spacing.lg }}
          style={{ flex: 1 }}
        >
          {step === 'pick_zone' && (
            <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(180)}>
              <View style={styles.zoneGrid}>
                {COACH_ZONES.map((z) => (
                  <Pressable key={z.slug} onPress={() => pickZone(z)} style={({ pressed }) => [pressed && styles.pressed, styles.zoneCell]}>
                    <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                      <View style={styles.zoneIconWrap}>
                        <IconHalo icon={z.icon} size="md" tone={z.tone} variant="tinted" />
                      </View>
                      <Text style={styles.zoneLabel}>{z.label}</Text>
                    </GlassCard>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {step === 'pick_option' && zone && (
            <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(180)}>
              {zone.options.map((o, idx) => (
                <Pressable
                  key={o.key}
                  onPress={() => pickOption(o)}
                  style={({ pressed }) => [pressed && styles.pressed, idx > 0 && { marginTop: spacing.md }]}
                >
                  <GlassCard tint={o.redFlag ? 'peach' : 'cream'} radius="xl" padding={spacing.lg}>
                    <Text style={[styles.optionLabel, o.redFlag && styles.optionLabelRedFlag]}>
                      {o.label}
                    </Text>
                  </GlassCard>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {step === 'show_result' && option && (
            <Animated.View entering={FadeIn.duration(360).easing(Easing.out(Easing.cubic))}>
              {option.redFlag ? (
                <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient>
                  <View style={styles.redFlagIcon}>
                    <IconHalo icon="bell" size="lg" tone="coral" variant="tinted" />
                  </View>
                  <Text style={styles.redFlagTitle}>{option.redFlag.title}</Text>
                  <Text style={styles.redFlagBody}>{option.redFlag.body}</Text>
                </GlassCard>
              ) : (
                <>
                  <GlassCard tint="lavender" radius="xl" padding={spacing.lg}>
                    <Text style={styles.resultEyebrow}>{t('coach_result_why')}</Text>
                    <Text style={styles.resultBody}>{option.rationale}</Text>
                  </GlassCard>

                  <View style={styles.cta}>
                    <PillCTA variant="primary" size="lg" onPress={startRoutine}>
                      {t('coach_cta_start')}
                    </PillCTA>
                  </View>

                  {option.articleSlug && (
                    <Pressable
                      onPress={() => openArticle(option.articleSlug as string)}
                      style={({ pressed }) => [pressed && styles.pressed, styles.learnMoreWrap]}
                    >
                      <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
                        <View style={styles.learnMoreRow}>
                          <IconHalo icon="book" size="md" tone="lavender" variant="tinted" />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.learnMoreTitle}>{t('coach_learn_more')}</Text>
                            <Text style={styles.learnMoreSub}>{t('coach_learn_more_sub')}</Text>
                          </View>
                        </View>
                      </GlassCard>
                    </Pressable>
                  )}
                </>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginTop: spacing.sm,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  zoneCell: {
    width: '47%',
  },
  zoneIconWrap: {
    marginBottom: spacing.sm,
  },
  zoneLabel: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
  optionLabel: {
    ...typeScale.title,
    color: colors.ink,
  },
  optionLabelRedFlag: {
    color: colors.primaryDeep,
  },
  resultEyebrow: {
    ...typeScale.label,
    color: colors.tertiary,
    marginBottom: spacing.sm,
  },
  resultBody: {
    ...typeScale.body,
    color: colors.ink,
    lineHeight: 24,
  },
  cta: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  learnMoreWrap: {
    marginTop: spacing.lg,
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  learnMoreTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  learnMoreSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  redFlagIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  redFlagTitle: {
    ...typeScale.headlineSm,
    color: colors.primaryDeep,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  redFlagBody: {
    ...typeScale.body,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 24,
  },
});
