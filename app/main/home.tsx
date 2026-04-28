import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  IconHalo,
  PillCTA,
  PremiumLock,
  TabBar,
  VideoPlaceholder,
} from '../../components/ui';
import type { HaloTone } from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';
import { useHomeSnapshot } from '../../hooks/useUserData';

type HomeState = 'first' | 'active' | 'premium' | 'reengage';

const STATE_CONFIG: Record<HomeState, {
  greeting: string;
  streakValue: string;
  streakSubLine: string;
  routineName: string;
  routineHint: string;
  routineCta: string;
  showPainCheckIn: boolean;
  tone: 'default' | 'dusk';
}> = {
  first: {
    greeting: 'Good afternoon, Marina.',
    streakValue: '0',
    streakSubLine: 'Your first stretch is waiting',
    routineName: 'Neck Unwind · first step',
    routineHint: '2 MIN · 2 EXERCISES',
    routineCta: 'Begin',
    showPainCheckIn: false,
    tone: 'default',
  },
  active: {
    greeting: 'Welcome back, Marina.',
    streakValue: '6',
    streakSubLine: 'Day 6 of a quiet 14-day program',
    routineName: 'Shoulder Release',
    routineHint: 'Based on your last session · 3 MIN',
    routineCta: 'Begin',
    showPainCheckIn: true,
    tone: 'default',
  },
  premium: {
    greeting: 'Welcome back, Marina.',
    streakValue: '6',
    streakSubLine: 'Day 6 · all zones unlocked',
    routineName: 'Shoulder Release',
    routineHint: 'Based on your last session · 3 MIN',
    routineCta: 'Begin',
    showPainCheckIn: true,
    tone: 'default',
  },
  reengage: {
    greeting: "It's been a moment.",
    streakValue: '6',
    streakSubLine: 'Streak paused — here when you\'re ready',
    routineName: 'Start small today · 90 seconds',
    routineHint: 'A single gentle neck exercise',
    routineCta: 'Just 90 seconds',
    showPainCheckIn: false,
    tone: 'dusk',
  },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ state?: HomeState }>();
  const rawState = (params.state as HomeState) || 'active';
  const explicitState: HomeState | null =
    rawState && ['first', 'active', 'premium', 'reengage'].includes(rawState as HomeState)
      ? (rawState as HomeState)
      : null;

  // Live data from Supabase (signed-in users). When `?state=` is set, mock
  // wins so we can still preview every variant for design review.
  const snap = useHomeSnapshot();
  const liveAvailable = !!snap.profile && !explicitState;

  // Pick which state's tone/copy template to use:
  //  - explicit ?state param wins for demos.
  //  - signed-in user with streak ≥ 1 → 'active' (or 'premium' if subscribed).
  //  - signed-in user with streak = 0 / never stretched → 'first'.
  //  - signed-out / no profile → fall back to legacy default 'active'.
  const inferredState: HomeState = liveAvailable
    ? snap.isPremium
      ? 'premium'
      : (snap.streak?.current_streak ?? 0) === 0
        ? 'first'
        : 'active'
    : explicitState ?? 'active';

  const baseCfg = STATE_CONFIG[inferredState];
  const cfg = liveAvailable
    ? {
        ...baseCfg,
        greeting: snap.profile?.display_name
          ? `Welcome back, ${snap.profile.display_name}.`
          : (snap.streak?.current_streak ?? 0) === 0
            ? 'Good afternoon.'
            : 'Welcome back.',
        streakValue: String(snap.streak?.current_streak ?? 0),
        streakSubLine:
          (snap.streak?.current_streak ?? 0) === 0
            ? 'Your first stretch is waiting'
            : `Day ${snap.streak?.current_streak} of your DeskCare habit`,
        routineName: snap.recommendedRoutine?.title ?? baseCfg.routineName,
        routineHint: snap.recommendedRoutine
          ? `${Math.round(snap.recommendedRoutine.duration_seconds / 60)} MIN · for your ${snap.onboardingData.pain_zones?.[0] ?? 'neck'}`
          : baseCfg.routineHint,
      }
    : baseCfg;
  const state = inferredState;

  const beginRoutine = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (snap.recommendedRoutine?.slug) {
      router.push({ pathname: '/exercise/preview', params: { routine: snap.recommendedRoutine.slug } } as never);
    } else {
      router.push('/exercise/preview');
    }
  };
  const openEyeBreak = () => {
    Haptics.selectionAsync();
    router.push('/eye/break');
  };
  const openPainCheckIn = () => {
    Haptics.selectionAsync();
    router.push('/pain/check-in');
  };

  const weekDots = useMemo(() => {
    const filled = Math.min(7, Math.max(0, parseInt(cfg.streakValue, 10) || 0));
    return Array.from({ length: 7 }, (_, i) => (i < filled ? 'filled' : i === filled ? 'today' : 'empty'));
  }, [cfg.streakValue]);

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={260} opacity={cfg.tone === 'dusk' ? 0.12 : 0.22} />
      {cfg.tone === 'dusk' && (
        <DecorativeArc position="bottom-left" tone="lavender" size={260} opacity={0.22} />
      )}

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + 200,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetSmall}>{state === 'premium' ? 'PRO · TODAY' : 'TODAY'}</Text>
            <Text style={styles.greetTitle}>{cfg.greeting}</Text>
          </View>
        </View>

        {/* Streak medallion / pool */}
        <View style={styles.streakWrap}>
          <GlassCard tint="peach" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
            <View style={styles.streakRow}>
              <View style={styles.streakNumCol}>
                <Text style={styles.streakNum}>{cfg.streakValue}</Text>
                <Eyebrow>DAY STREAK</Eyebrow>
              </View>
              <View style={styles.weekDotsCol}>
                {weekDots.map((s, i) => (
                  <View
                    key={i}
                    style={[
                      styles.weekDot,
                      s === 'filled' && styles.weekDotFilled,
                      s === 'today' && styles.weekDotToday,
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.streakSub}>{cfg.streakSubLine}</Text>
          </GlassCard>
        </View>

        {/* For you today */}
        <View style={styles.forYouRow}>
          <Eyebrow>FOR YOU TODAY</Eyebrow>
        </View>

        <Pressable onPress={beginRoutine} style={({ pressed }) => [pressed && styles.pressed]}>
          <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
            <View style={styles.routineRow}>
              <VideoPlaceholder pose="neck-roll" compact showPlay />
              <View style={styles.routineText}>
                <Text style={styles.routineName}>{cfg.routineName}</Text>
                <Text style={styles.routineHint}>{cfg.routineHint}</Text>
              </View>
            </View>
            <View style={styles.routineCtaWrap}>
              <MatteCoralPill label={cfg.routineCta} />
            </View>
          </GlassCard>
        </Pressable>

        {/* Eye break — shown in all states */}
        <Pressable onPress={openEyeBreak} style={({ pressed }) => [pressed && styles.pressed, styles.eyeRowWrap]}>
          <GlassCard tint="lavender" radius="xl" padding={spacing.lg}>
            <View style={styles.eyeRow}>
              <IconHalo icon="eye" size="md" tone="lavender" variant="tinted" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.eyeTitle}>Eyes tired?</Text>
                <Text style={styles.eyeSub}>30 seconds · 20 ft away</Text>
              </View>
              <View style={styles.eyeArrow}>
                <Svg width={16} height={16} viewBox="0 0 16 16">
                  <Path d="M6 3 L11 8 L6 13" stroke={colors.primaryMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </View>
            </View>
          </GlassCard>
        </Pressable>

        {/* Body zone selector */}
        <View style={styles.zoneRowWrap}>
          <Eyebrow>YOUR ZONES</Eyebrow>
          <View style={styles.zoneRow}>
            {ZONES.map((z) => (
              <ZoneCircle
                key={z.id}
                label={z.label}
                duration={z.duration}
                icon={z.icon}
                tone={z.tone}
                warm={z.id === 'neck' && state !== 'first'}
                locked={!(state === 'premium' || z.free)}
              />
            ))}
          </View>
        </View>

        {/* Pain check-in banner */}
        {cfg.showPainCheckIn && (
          <Pressable onPress={openPainCheckIn} style={({ pressed }) => [pressed && styles.pressed, styles.painCheckInWrap]}>
            <GlassCard tint="peach" radius="xl" padding={spacing.lg}>
              <View style={styles.painRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.painTitle}>How's your neck today?</Text>
                  <Text style={styles.painSub}>Rate it — we'll adjust tomorrow's plan</Text>
                </View>
                <View style={styles.painArrow}>
                  <Svg width={16} height={16} viewBox="0 0 16 16">
                    <Path d="M6 3 L11 8 L6 13" stroke={colors.primaryDeep} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </Svg>
                </View>
              </View>
            </GlassCard>
          </Pressable>
        )}

        {/* Premium: programs row */}
        {state === 'premium' && (
          <View style={styles.programsWrap}>
            <Eyebrow>YOUR PROGRAMS</Eyebrow>
            <View style={styles.programsRow}>
              <ProgramTile label="Sciatica" subtitle="Week 2" tone="coral" />
              <ProgramTile label="Carpal" subtitle="Week 1" tone="mint" />
              <ProgramTile label="Eye Yoga" subtitle="Active" tone="lavender" />
            </View>
          </View>
        )}

        {/* Re-engagement: 90s CTA */}
        {state === 'reengage' && (
          <View style={styles.reEngageCtaWrap}>
            <PillCTA variant="primary" size="lg" breath onPress={beginRoutine}>
              Just 90 seconds
            </PillCTA>
          </View>
        )}
      </ScrollView>

      <TabBar current="home" />
    </AtmosphericBackground>
  );
}

const ZONES = [
  { id: 'neck',    label: 'Neck',    duration: '3 MIN',  icon: 'infinity' as const, tone: 'coral'    as HaloTone, free: true },
  { id: 'back',    label: 'Back',    duration: '4 MIN',  icon: 'refresh'  as const, tone: 'peach'    as HaloTone, free: false },
  { id: 'eyes',    label: 'Eyes',    duration: '30 SEC', icon: 'eye'      as const, tone: 'lavender' as HaloTone, free: true },
  { id: 'wrists',  label: 'Wrists',  duration: '2 MIN',  icon: 'plus'     as const, tone: 'mint'     as HaloTone, free: false },
];

const ZoneCircle: React.FC<{
  label: string;
  duration: string;
  icon: 'infinity' | 'refresh' | 'eye' | 'plus';
  tone: HaloTone;
  warm?: boolean;
  locked?: boolean;
}> = ({ label, duration, icon, tone, warm, locked }) => (
  <View style={styles.zoneItem}>
    <View style={[styles.zoneCircle, warm && styles.zoneCircleWarm, locked && styles.zoneCircleLocked]}>
      <IconHalo icon={icon} size="md" tone={tone} variant={warm ? 'gradient' : 'tinted'} glow={warm} />
    </View>
    <Text style={[styles.zoneLabel, locked && styles.zoneLabelLocked]}>{label}</Text>
    <Text style={[styles.zoneDuration, locked && styles.zoneLabelLocked]}>{duration}</Text>
    {locked && (
      <View style={styles.zoneLockBadge}>
        <PremiumLock size="xs" tone="subtle" />
      </View>
    )}
  </View>
);

/**
 * Non-interactive matte coral-glass pill — visual affordance inside cards
 * whose whole surface is the tap target. Same matte-glass language as the
 * primary PillCTA but compact and decoupled from press handling.
 */
const MatteCoralPill: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.mcpOuter}>
    {Platform.OS === 'ios' ? (
      <BlurView intensity={32} tint="light" style={styles.mcpBlur}>
        <View style={[StyleSheet.absoluteFill, styles.mcpFill]} pointerEvents="none" />
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(255,255,255,0.10)',
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.10)',
          ] as const}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </BlurView>
    ) : (
      <View style={[StyleSheet.absoluteFill, styles.mcpFillAndroid]} pointerEvents="none" />
    )}
    <LinearGradient
      pointerEvents="none"
      colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0)'] as const}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.mcpSheen}
    />
    <View style={styles.mcpBorder} pointerEvents="none" />
    <View style={styles.mcpContent}>
      <Text style={styles.mcpText}>{label}</Text>
    </View>
  </View>
);

const ProgramTile: React.FC<{ label: string; subtitle: string; tone: HaloTone }> = ({ label, subtitle, tone }) => (
  <View style={styles.programTile}>
    <GlassCard tint={tone === 'coral' ? 'coral' : tone === 'mint' ? 'mint' : 'lavender'} radius="lg" padding={spacing.md}>
      <Text style={styles.programLabel}>{label}</Text>
      <Text style={styles.programSub}>{subtitle}</Text>
      <View style={styles.programDot} />
    </GlassCard>
  </View>
);

const styles = StyleSheet.create({
  greetRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  greetSmall: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  greetTitle: {
    ...typeScale.headlineSm,
    color: colors.ink,
  },
  streakWrap: {
    marginBottom: spacing.xl,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  streakNumCol: {
    alignItems: 'flex-start',
  },
  streakNum: {
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.2,
    fontFamily: typeScale.display.fontFamily,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  weekDotsCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(232,123,78,0.22)',
  },
  weekDotFilled: {
    backgroundColor: colors.primaryMid,
    borderColor: colors.primaryMid,
  },
  weekDotToday: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDeep,
    transform: [{ scale: 1.15 }],
  },
  streakSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.md,
  },
  forYouRow: {
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  routineText: {
    flex: 1,
    minWidth: 0,
  },
  routineName: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  routineHint: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  routineCtaWrap: {
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  mcpOuter: {
    borderRadius: 999,
    overflow: 'hidden',
    ...shadows.chip,
  },
  mcpBlur: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mcpFill: {
    backgroundColor: 'rgba(232,123,78,0.78)',
  },
  mcpFillAndroid: {
    backgroundColor: 'rgba(232,123,78,0.92)',
  },
  mcpSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  mcpBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  mcpContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
  },
  mcpText: {
    ...typeScale.title,
    color: colors.white,
    fontFamily: typeScale.titleLg.fontFamily,
  },
  eyeRowWrap: {
    marginTop: spacing.md,
  },
  eyeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  eyeTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  eyeSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  eyeArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneRowWrap: {
    marginTop: spacing.xl,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  zoneItem: {
    alignItems: 'center',
    gap: 4,
  },
  zoneCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  zoneCircleWarm: {
    backgroundColor: colors.primarySoft,
  },
  zoneCircleLocked: {
    opacity: 0.65,
  },
  zoneLabel: {
    ...typeScale.bodySm,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  zoneLabelLocked: {
    color: colors.inkSubtle,
  },
  zoneDuration: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
  },
  zoneLockBadge: {
    position: 'absolute',
    top: -2,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  painCheckInWrap: {
    marginTop: spacing.xl,
  },
  painRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  painTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  painSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  painArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  programsWrap: {
    marginTop: spacing.xl,
  },
  programsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  programTile: {
    flex: 1,
  },
  programLabel: {
    ...typeScale.title,
    color: colors.ink,
  },
  programSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  programDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMid,
    marginTop: spacing.sm,
  },
  reEngageCtaWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
