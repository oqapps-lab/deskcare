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
  IconHalo,
  TabBar,
} from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

const PROGRAMS = [
  {
    id: 'sciatica',
    title: 'Sciatica Relief',
    blurb: 'Starts with a 6-question check-in.',
    meta: '2 PHASES · 14 EXERCISES · CLINICIAN-REVIEWED',
    tone: 'peach' as const,
    icon: 'refresh' as const,
    premium: true,
    route: '/programs/sciatica',
  },
  {
    id: 'eye',
    title: 'Eye Program',
    blurb: '20-20-20 timer plus 5 gentle routines.',
    meta: '20-20-20 TIMER · 5 EYE EXERCISES · FREE',
    tone: 'lavender' as const,
    icon: 'eye' as const,
    premium: false,
    route: '/programs/eye',
  },
  {
    id: 'carpal',
    title: 'Carpal Tunnel Care',
    blurb: 'Median-nerve glides and wrist resets.',
    meta: '3 PHASES · 9 EXERCISES · CLINICIAN-REVIEWED',
    tone: 'mint' as const,
    icon: 'plus' as const,
    premium: true,
    // Detail screen ships in a later batch — for now, premium-gate
    // routes to the paywall, where the user converts before unlocking.
    route: '/onboarding/paywall',
  },
];

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();

  const open = (route: string) => {
    Haptics.selectionAsync();
    router.push(route as never);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="peach" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.22} />
      <DecorativeArc position="bottom-left" tone="lavender" size={220} opacity={0.16} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + 130,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow variant="accent">PROGRAMS FOR REAL CONDITIONS</Eyebrow>
        <Text style={styles.title}>Structured, not random.</Text>
        <Text style={styles.sub}>Multi-week curricula with check-ins, contraindications, and red-flag screening.</Text>

        <View style={styles.list}>
          {PROGRAMS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => open(p.route)}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GlassCard tint={p.tone} radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
                <View style={styles.row}>
                  <IconHalo icon={p.icon} size="md" tone={p.tone} variant="tinted" />
                  <View style={styles.rowText}>
                    <View style={styles.rowTitleRow}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {p.title}
                      </Text>
                      {p.premium ? <KeyGlyph /> : <FreeDot />}
                    </View>
                    <Text style={styles.rowMeta}>{p.meta}</Text>
                  </View>
                </View>
                <Text style={styles.blurb}>{p.blurb}</Text>
                <View style={styles.cardCta}>
                  <View style={styles.ctaPill}>
                    <Text style={styles.ctaText}>Open program</Text>
                    <Svg width={14} height={14} viewBox="0 0 14 14">
                      <Path d="M5 3 L9 7 L5 11" stroke={colors.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <TabBar current="programs" />
    </AtmosphericBackground>
  );
}

const KeyGlyph = () => (
  <Svg width={16} height={16} viewBox="0 0 14 14">
    <Path d="M5 9 a3 3 0 1 1 4 0 L9 9 L12 12 L10 14 L9 13 L8 14 L7 13" stroke={colors.primaryMid} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);

const FreeDot = () => <View style={styles.freeDot} />;

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
    marginBottom: spacing.xl,
  },
  list: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    ...typeScale.headlineSm,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  rowMeta: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  blurb: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.md,
  },
  cardCta: {
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.primaryMid,
    ...shadows.chip,
  },
  ctaText: {
    ...typeScale.title,
    color: colors.white,
    fontFamily: typeScale.titleLg.fontFamily,
  },
  freeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMid,
  },
});
