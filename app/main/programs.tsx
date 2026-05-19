import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
  PremiumLock,
  TabBar,
} from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';
import { useIsPremium } from '../../lib/premium';
import { t } from '../../lib/i18n';

const buildPrograms = () => [
  {
    id: 'sciatica',
    title: t('prog_sciatica_title'),
    blurb: t('prog_sciatica_blurb'),
    meta: t('prog_sciatica_meta'),
    tone: 'peach' as const,
    icon: 'refresh' as const,
    premium: true,
    route: '/programs/sciatica',
  },
  {
    id: 'eye',
    title: t('prog_eye_title'),
    blurb: t('prog_eye_blurb'),
    meta: t('prog_eye_meta'),
    tone: 'lavender' as const,
    icon: 'eye' as const,
    premium: false,
    route: '/programs/eye',
  },
  {
    id: 'carpal',
    title: t('prog_carpal_title'),
    blurb: t('prog_carpal_blurb'),
    meta: t('prog_carpal_meta'),
    tone: 'mint' as const,
    icon: 'plus' as const,
    premium: true,
    route: '/onboarding/paywall',
  },
];

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const isPremium = useIsPremium();
  const PROGRAMS = buildPrograms();

  const open = (route: string, premium: boolean) => {
    Haptics.selectionAsync();
    // Premium-locked programs route to the paywall when the user is not
    // entitled. Premium-entitled (or TF-bypass) users go to the program.
    if (premium && !isPremium) {
      router.push('/onboarding/paywall' as never);
      return;
    }
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
        <Eyebrow variant="accent">{t('programs_eyebrow')}</Eyebrow>
        <Text style={styles.title}>{t('programs_title')}</Text>
        <Text style={styles.sub}>{t('programs_sub')}</Text>

        <View style={styles.list}>
          {PROGRAMS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => open(p.route, p.premium)}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <GlassCard tint={p.tone} radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
                <View style={styles.row}>
                  <IconHalo icon={p.icon} size="md" tone={p.tone} variant="tinted" />
                  <View style={styles.rowText}>
                    <View style={styles.rowTitleRow}>
                      <Text style={styles.rowTitle} numberOfLines={2}>
                        {p.title}
                      </Text>
                      {p.premium && !isPremium ? <PremiumLock size="sm" /> : <FreeDot />}
                    </View>
                    <Text style={styles.rowMeta}>{p.meta}</Text>
                  </View>
                </View>
                <Text style={styles.blurb}>{p.blurb}</Text>
                <View style={styles.cardCta}>
                  <OpenProgramPill />
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

const FreeDot = () => <View style={styles.freeDot} />;

/**
 * Matte coral-glass mini pill used as the visual "Open program" affordance
 * on each program card. Non-interactive — the whole card is the tap target.
 * Same matte-glass language as PillCTA primary (BlurView + coral tint +
 * sheen + hairline) but sized down to fit inside a card.
 */
const OpenProgramPill: React.FC = () => (
  <View style={styles.ctaPillOuter}>
    {Platform.OS === 'ios' ? (
      <BlurView intensity={30} tint="light" style={styles.ctaPillBlur}>
        <View style={[StyleSheet.absoluteFill, styles.ctaPillFill]} pointerEvents="none" />
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(255,255,255,0.10)',
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.08)',
          ] as const}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </BlurView>
    ) : (
      <View style={[StyleSheet.absoluteFill, styles.ctaPillFillAndroid]} pointerEvents="none" />
    )}
    <LinearGradient
      pointerEvents="none"
      colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)'] as const}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.ctaPillSheen}
    />
    <View style={styles.ctaPillBorder} pointerEvents="none" />
    <View style={styles.ctaPillContent}>
      <Text style={styles.ctaText}>{t('programs_open')}</Text>
      <Svg width={14} height={14} viewBox="0 0 14 14">
        <Path
          d="M5 3 L9 7 L5 11"
          stroke={colors.white}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  </View>
);

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
  ctaPillOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    ...shadows.chip,
  },
  ctaPillBlur: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ctaPillFill: {
    backgroundColor: 'rgba(232,123,78,0.78)',
  },
  ctaPillFillAndroid: {
    backgroundColor: 'rgba(232,123,78,0.92)',
  },
  ctaPillSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  ctaPillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  ctaPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
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
