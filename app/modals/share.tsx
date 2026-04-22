import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, Path, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  Eyebrow,
  GlassCard,
  Glyph,
} from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

const TARGETS = [
  { id: 'story',     label: 'Instagram Story' },
  { id: 'feed',      label: 'Instagram Feed' },
  { id: 'message',   label: 'Messages' },
  { id: 'more',      label: 'More...' },
];

export default function ShareScreen() {
  const insets = useSafeAreaInsets();

  const close = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };
  const copy = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const pickTarget = (_id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />

      <View style={[styles.closeWrap, { top: insets.top + spacing.sm }]}>
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close share sheet">
          <View style={styles.closeBtn}>
            <Glyph name="close-x" size={16} color={colors.inkMuted} />
          </View>
        </Pressable>
      </View>

      <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: insets.bottom + spacing.xxxl }]}>
        <Eyebrow variant="accent">SHARE YOUR WEEK</Eyebrow>
        <Text style={styles.title}>A little proof, for{'\n'}the record.</Text>

        {/* Poster preview card */}
        <View style={styles.posterWrap}>
          <View style={styles.poster}>
            <Svg width="100%" height="100%" viewBox="0 0 320 360" preserveAspectRatio="xMidYMid slice">
              <Defs>
                <SvgRadialGradient id="sh-bg" cx="30%" cy="30%" r="80%">
                  <Stop offset="0"   stopColor={colors.primaryLight} stopOpacity="0.7" />
                  <Stop offset="0.6" stopColor={colors.primarySoft}  stopOpacity="0.95" />
                  <Stop offset="1"   stopColor={colors.canvas}       stopOpacity="1" />
                </SvgRadialGradient>
              </Defs>
              <Rect x="0" y="0" width="320" height="360" rx="28" fill="url(#sh-bg)" />
              <Circle cx="250" cy="70" r="70" fill={colors.primaryMid} opacity="0.2" />
              <Circle cx="60"  cy="290" r="56" fill={colors.primaryLight} opacity="0.28" />
            </Svg>
            <View style={styles.posterContent} pointerEvents="none">
              <Text style={styles.posterEyebrow}>DESKCARE · WEEK 1</Text>
              <Text style={styles.posterNumber}>7</Text>
              <Text style={styles.posterSub}>days of small releases</Text>
              <View style={styles.posterFacts}>
                <PosterFact v="14" l="MIN" />
                <PosterSep />
                <PosterFact v="21" l="MOVES" />
                <PosterSep />
                <PosterFact v="6"  l="STREAK" />
              </View>
            </View>
          </View>
        </View>

        <Pressable onPress={copy} hitSlop={8} style={({ pressed }) => [styles.copyLink, pressed && styles.pressed]}>
          <Glyph name="check" size={14} color={colors.primaryMid} />
          <Text style={styles.copyLinkText}>Copy link</Text>
        </Pressable>

        {/* Target grid */}
        <View style={styles.targetsRow}>
          {TARGETS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => pickTarget(t.id)}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              style={({ pressed }) => [styles.target, pressed && styles.pressed]}
            >
              <View style={styles.targetCircle}>
                <TargetGlyph id={t.id} />
              </View>
              <Text style={styles.targetLabel}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const TargetGlyph: React.FC<{ id: string }> = ({ id }) => {
  const stroke = colors.primaryMid;
  if (id === 'story') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth="2" fill="none" strokeDasharray="3 2" />
        <Circle cx="12" cy="12" r="4" fill={stroke} />
      </Svg>
    );
  }
  if (id === 'feed') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Rect x="4" y="4" width="16" height="16" rx="4" stroke={stroke} strokeWidth="2" fill="none" />
        <Circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth="2" fill="none" />
        <Circle cx="17" cy="7" r="1" fill={stroke} />
      </Svg>
    );
  }
  if (id === 'message') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path d="M4 6 Q4 4 6 4 L18 4 Q20 4 20 6 L20 14 Q20 16 18 16 L10 16 L6 19 L6 16 Q4 16 4 14 Z" stroke={stroke} strokeWidth="2" fill="none" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx="6"  cy="12" r="1.6" fill={stroke} />
      <Circle cx="12" cy="12" r="1.6" fill={stroke} />
      <Circle cx="18" cy="12" r="1.6" fill={stroke} />
    </Svg>
  );
};

const PosterFact: React.FC<{ v: string; l: string }> = ({ v, l }) => (
  <View style={styles.posterFactCol}>
    <Text style={styles.posterFactV}>{v}</Text>
    <Text style={styles.posterFactL}>{l}</Text>
  </View>
);
const PosterSep = () => <View style={styles.posterFactSep} />;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
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
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  posterWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  poster: {
    width: 260,
    height: 300,
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.lift,
  },
  posterContent: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  posterEyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
  },
  posterNumber: {
    fontSize: 120,
    lineHeight: 120,
    color: colors.primary,
    fontFamily: typeScale.display.fontFamily,
    letterSpacing: -3,
    marginTop: spacing.sm,
  },
  posterSub: {
    ...typeScale.body,
    color: colors.ink,
  },
  posterFacts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  posterFactCol: {
    flex: 1,
    alignItems: 'center',
  },
  posterFactV: {
    ...typeScale.titleLg,
    color: colors.primaryDeep,
    fontFamily: typeScale.headline.fontFamily,
  },
  posterFactL: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  posterFactSep: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(138,114,106,0.22)',
  },
  copyLink: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.xl,
  },
  copyLinkText: {
    ...typeScale.bodySm,
    color: colors.primaryDeep,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  target: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  targetCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  targetLabel: {
    ...typeScale.labelSm,
    color: colors.inkMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
