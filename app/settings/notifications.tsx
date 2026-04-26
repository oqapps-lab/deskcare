import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { BgPattern } from '../../components/ui/BgPattern';
import { DecorativeArc } from '../../components/ui/DecorativeArc';
import { NavHeader } from '../../components/ui/NavHeader';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { PillChip } from '../../components/ui/PillChip';
import { PillCTA } from '../../components/ui/PillCTA';
import { IconHalo } from '../../components/ui/IconHalo';
import { GlassCard } from '../../components/ui/GlassCard';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { Glyph } from '../../components/ui/Glyph';
import type { GlyphName } from '../../components/ui/Glyph';
import type { HaloTone } from '../../components/ui/IconHalo';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';
import {
  cancelAllScheduledReminders,
  scheduleDailyReminder,
} from '../../lib/notifications';

const TIMES = ['09:00', '12:00', '15:00', '18:00'];

/**
 * Apply the user's chip+toggle picks to the OS notification center.
 * Strategy: cancel everything currently scheduled (we can't tell ours from
 * other apps' anyway because the API only returns ours), then re-schedule
 * a single daily nudge at the picked stretch time, plus an eye-break nudge
 * three hours later if the toggle is on. Sound flag controls 'default' vs
 * silent payload (handled at the OS level via the sound prop on the
 * scheduled notification — undefined = silent).
 */
async function applyReminderSchedule(
  stretchTime: string,
  eyeTimer: boolean,
  sound: boolean,
) {
  await cancelAllScheduledReminders();

  const [hStr, mStr] = stretchTime.split(':');
  const hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);

  await scheduleDailyReminder(
    hour,
    minute,
    sound
      ? 'A short release for your shoulders.'
      : 'Time to stretch.',
    'DeskCare',
  );

  if (eyeTimer) {
    // 3-hour offset so the two nudges don't pile up at the same instant.
    const eyeHour = (hour + 3) % 24;
    await scheduleDailyReminder(
      eyeHour,
      minute,
      'Look 20 ft away for 20 seconds.',
      'Eye break',
    );
  }
}

/**
 * Notification & reminder settings. Flow entry: after Permission Prompt.
 * Primary CTA "Продолжить" continues the demo into /eye/break.
 */
export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const userId = useUserId();

  const [activeTime, setActiveTime] = useState('15:00');
  const [eyeTimer, setEyeTimer] = useState(true);
  const [sound, setSound] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // On mount: load current reminder rows + audio_enabled. If no rows exist
  // yet (fresh user), keep the defaults so the screen still renders.
  useEffect(() => {
    if (!userId) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const [rs, us] = await Promise.all([
        supabase
          .from('reminder_schedules')
          .select('reminder_type, start_time, is_active')
          .eq('user_id', userId),
        supabase.from('user_settings').select('audio_enabled').eq('user_id', userId).maybeSingle(),
      ]);
      if (cancelled) return;

      const stretch = (rs.data ?? []).find((r) => r.reminder_type === 'stretch');
      if (stretch?.start_time) {
        // start_time arrives as "HH:MM:SS" — collapse to "HH:MM" for chip match.
        const trimmed = String(stretch.start_time).slice(0, 5);
        if (TIMES.includes(trimmed)) setActiveTime(trimmed);
      }
      const eye = (rs.data ?? []).find((r) => r.reminder_type === 'eye_break');
      setEyeTimer(eye ? !!eye.is_active : true);

      if (us.data && typeof us.data.audio_enabled === 'boolean') {
        setSound(us.data.audio_enabled);
      }
      setHydrated(true);
    })().catch(() => setHydrated(true));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Persist the row whenever a pick changes, debounced via the trailing
  // ref so rapid taps don't queue many writes.
  const persistTimer = React.useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!userId || !hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(async () => {
      const [hStr, mStr] = activeTime.split(':');
      const startTime = `${hStr.padStart(2, '0')}:${mStr.padStart(2, '0')}:00`;
      // Stretch row: upsert with picked time.
      await supabase.from('reminder_schedules').upsert(
        {
          user_id: userId,
          reminder_type: 'stretch',
          start_time: startTime,
          end_time: '18:00:00',
          interval_minutes: 60,
          is_active: true,
        },
        { onConflict: 'user_id,reminder_type' },
      );
      // Eye-break row: upsert with toggle state.
      await supabase.from('reminder_schedules').upsert(
        {
          user_id: userId,
          reminder_type: 'eye_break',
          start_time: '09:00:00',
          end_time: '18:00:00',
          interval_minutes: 20,
          is_active: eyeTimer,
        },
        { onConflict: 'user_id,reminder_type' },
      );
      // Sound flag lives in user_settings.audio_enabled.
      await supabase
        .from('user_settings')
        .update({ audio_enabled: sound })
        .eq('user_id', userId);
    }, 250);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [userId, hydrated, activeTime, eyeTimer, sound]);

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(14);
  const chipsOpacity = useSharedValue(0);
  const rowsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 400 });
    contentY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    chipsOpacity.value = withDelay(reduceMotion ? 0 : 180, withTiming(1, { duration: 400 }));
    rowsOpacity.value = withDelay(reduceMotion ? 0 : 320, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(reduceMotion ? 0 : 480, withTiming(1, { duration: 400 }));
  }, [reduceMotion, contentOpacity, contentY, chipsOpacity, rowsOpacity, ctaOpacity]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const chipsStyle = useAnimatedStyle(() => ({ opacity: chipsOpacity.value }));
  const rowsStyle = useAnimatedStyle(() => ({ opacity: rowsOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const continueFlow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Reflect the current picks to the OS notification center. Best-effort:
    // if scheduling fails (e.g. permission was just denied), the DB still
    // holds the user's preferences for the next attempt.
    try {
      await applyReminderSchedule(activeTime, eyeTimer, sound);
    } catch {
      // soft-fail; user can re-toggle from this screen later
    }
    router.push('/onboarding/paywall');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={220} opacity={0.20} />

      <NavHeader title="Reminders" onBack={back} />

      <Animated.View style={[styles.wrap, contentStyle]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + 120, // floating CTA clearance
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.title}>When should we{'\n'}nudge you?</Text>
            <Text style={styles.subtitle}>
              Pick a time that fits your day —{'\n'}we'll adapt the rest
            </Text>
          </View>

          <View style={styles.eyebrowRow}>
            <Eyebrow>DAILY SCHEDULE</Eyebrow>
          </View>

          <Animated.View style={[styles.chipRow, chipsStyle]}>
            {TIMES.map((t) => (
              <PillChip
                key={t}
                active={t === activeTime}
                onPress={() => setActiveTime(t)}
                size="md"
              >
                {t}
              </PillChip>
            ))}
          </Animated.View>

          <View style={styles.eyebrowRow}>
            <Eyebrow>MORE OPTIONS</Eyebrow>
          </View>

          <Animated.View style={[styles.rows, rowsStyle]}>
            <GlassRow
              icon="eye"
              tone="lavender"
              tint="lavender"
              title="20-20-20 for eyes"
              sub="Every 20 min — 20 sec, 20 ft away"
              right={
                <ToggleSwitch value={eyeTimer} onChange={setEyeTimer} />
              }
            />
            <GlassRow
              icon="speaker"
              tone="coral"
              tint="peach"
              title="Notification sound"
              sub="Soft tone, never sharp"
              right={<ToggleSwitch value={sound} onChange={setSound} />}
            />
            <GlassRow
              icon="crown"
              tone="coral"
              tint="coral"
              title="Premium"
              sub="Sciatica & carpal-tunnel programs"
              badge="PRO"
              innerGradient
              decorativeCorner
              right={<Glyph name="chevron-right" size={18} color={colors.inkSubtle} />}
              onPress={() => {
                Haptics.selectionAsync();
              }}
            />
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[
            styles.ctaFloating,
            ctaStyle,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
          pointerEvents="box-none"
        >
          <LinearGradient
            colors={[
              'rgba(251,249,245,0)',
              'rgba(251,249,245,0.85)',
              'rgba(251,249,245,1)',
            ]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <PillCTA
            variant="primary"
            size="lg"
            icon="check"
            iconBg
            breath
            onPress={continueFlow}
          >
            Continue
          </PillCTA>
        </Animated.View>
      </Animated.View>
    </AtmosphericBackground>
  );
}

interface GlassRowProps {
  icon: GlyphName;
  tone: HaloTone;
  tint: 'cream' | 'peach' | 'lavender' | 'mint' | 'coral';
  title: string;
  sub: string;
  badge?: string;
  right: React.ReactNode;
  innerGradient?: boolean;
  decorativeCorner?: boolean;
  onPress?: () => void;
}

const GlassRow: React.FC<GlassRowProps> = ({
  icon,
  tone,
  tint,
  title,
  sub,
  badge,
  right,
  innerGradient = true,
  decorativeCorner = false,
  onPress,
}) => {
  const content = (
    <GlassCard
      tint={tint}
      radius="xl"
      padding={spacing.lg}
      innerGradient={innerGradient}
      decorativeCorner={decorativeCorner}
    >
      <View style={rowStyles.row}>
        <IconHalo icon={icon} size="md" tone={tone} variant="tinted" glow={false} />
        <View style={rowStyles.textCol}>
          <View style={rowStyles.titleRow}>
            <Text style={rowStyles.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            {badge && (
              <View style={rowStyles.badge}>
                <Eyebrow variant="accent" size="sm">
                  {badge}
                </Eyebrow>
              </View>
            )}
          </View>
          <Text style={rowStyles.sub} numberOfLines={2}>
            {sub}
          </Text>
        </View>
        <View style={rowStyles.rightCol}>{right}</View>
      </View>
    </GlassCard>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      hitSlop={4}
      style={({ pressed }) => (pressed ? rowStyles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  headerBlock: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  subtitle: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  eyebrowRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  rows: {
    gap: spacing.md,
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typeScale.titleLg,
    color: colors.ink,
    flex: 1,
    minWidth: 0,
  },
  sub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    flexShrink: 0,
  },
  rightCol: {
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
