import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  Glyph,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

const PERKS = [
  'Every program, every zone',
  'Sciatica & carpal tunnel care',
  'Pain tracking & insights',
];

export default function MiniPaywallScreen() {
  const insets = useSafeAreaInsets();

  const unlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/onboarding/paywall');
  };
  const close = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={240} opacity={0.22} />

      <View style={[styles.closeWrap, { top: insets.top + spacing.sm }]}>
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <View style={styles.closeBtn}>
            <Glyph name="close-x" size={16} color={colors.inkMuted} />
          </View>
        </Pressable>
      </View>

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View>
          <View style={styles.keyWrap}>
            <Svg width={48} height={48} viewBox="0 0 24 24">
              <Path
                d="M9 14 a4 4 0 1 1 4.6 -4 L20 10 L20 14 L18 14 L18 16 L16 16 L16 14 L13.6 14 A4 4 0 0 1 9 14 Z"
                fill={colors.primaryMid}
              />
              <Path d="M7 12 L7 12.2" stroke={colors.white} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </View>

          <Eyebrow variant="accent">PREMIUM FEATURE</Eyebrow>
          <Text style={styles.title}>Unlock every zone{'\n'}and program.</Text>
          <Text style={styles.sub}>7-day free trial, then $2.49/month billed yearly.</Text>

          <GlassCard tint="peach" radius="xl" padding={spacing.lg} innerGradient>
            {PERKS.map((p, i) => (
              <React.Fragment key={p}>
                <View style={styles.perkRow}>
                  <View style={styles.check}>
                    <Svg width={12} height={12} viewBox="0 0 12 12">
                      <Path d="M2.5 6.5 L5 9 L9.5 3.5" stroke={colors.primaryDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                  </View>
                  <Text style={styles.perkText}>{p}</Text>
                </View>
                {i < PERKS.length - 1 && <View style={styles.perkDivider} />}
              </React.Fragment>
            ))}
          </GlassCard>
        </View>

        <View style={styles.ctaBlock}>
          <PillCTA variant="primary" size="lg" breath onPress={unlock}>
            Begin 7 days free
          </PillCTA>
          <Text style={styles.afterText}>Cancel anytime · No charge during trial</Text>
          <Pressable hitSlop={12} onPress={close} style={{ marginTop: spacing.md }}>
            <Text style={styles.notNowLink}>Not right now</Text>
          </Pressable>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
  },
  closeWrap: {
    position: 'absolute',
    right: spacing.xxl,
    zIndex: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    ...typeScale.body,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  perkDivider: {
    height: 1,
    backgroundColor: colors.inkHairline,
  },
  ctaBlock: {
    alignItems: 'center',
  },
  afterText: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  notNowLink: {
    ...typeScale.title,
    color: colors.primaryMid,
  },
});
